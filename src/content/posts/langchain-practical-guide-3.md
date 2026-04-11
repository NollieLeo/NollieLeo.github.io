---
title: LangChain实战(三)：强制 AI 稳定输出结构化 JSON 数据
published: 2026-02-14T10:10:00.000Z
description: 解决前端数据解析痛点！学习如何使用 LangChain 的 withStructuredOutput 结合 Zod，告别正则提取 JSON，让大模型稳定输出强类型数据。
tags:
  - LangChain
  - AI
  - Zod
category: "AI大模型"
---

做过 AI 应用的前端同学，一定面临过数据解析的挑战：为了让大模型输出 JSON，你需要在 Prompt 里反复强调“只输出 JSON，不要有任何多余文字”。

即便如此，大模型偶尔还是会产生不符合预期的输出，在 JSON 前面加一句“好的，这是你要的数据：”，或者在后面加一个不规范的代码块标记。于是，你只能在后端写一堆复杂的正则表达式去从 Markdown 块里提取那段 JSON 字符串。这种方式存在局限性，而且没有任何类型保证，一旦大模型改了字段名，系统就会受到影响。

今天我们就聊聊如何通过 LangChain 的核心功能 `.withStructuredOutput`，结合前端熟悉的 Zod，有效解决这个问题。

## 挑战：正则提取的局限性

在没有结构化输出之前，我们的流程通常是这样的：

1. **构建 Prompt**：明确要求输出 JSON，甚至要提供 Few-shot 示例。
2. **文本生成**：调用 `model.invoke()` 拿到一段包含 JSON 的 Markdown 文本。
3. **正则清洗**：用正则提取 ` ```json ... ``` ` 块。
4. **反序列化**：执行 `JSON.parse()`。
5. **手动校验**：编写冗长的代码检查字段是否存在、类型是否正确。

这个流程里的每一步都充满了不确定性。只要正则没匹配到，或者 JSON 格式稍微有点瑕疵（比如多了一个逗号），后端就会抛出异常。这种“基于文本解析”的方案在生产环境下是不建议使用的。

## 深度解析：什么是 Native Tool Calling？

为了解决上述问题，主流模型厂商（OpenAI, Anthropic, Google 等）在 API 层面引入了 **Function Calling / Tool Calling**。这不仅仅是一个 Prompt 技巧，而是模型能力的底层进化。

### API 层面的运作机制

当你调用 `.withStructuredOutput(ZodSchema)` 时，LangChain 并不是在 Prompt 后面偷偷加了一句“请输出 JSON”。它实际上是在 API 请求的 `tools` 或 `functions` 参数中，发送了一个标准的 **JSON Schema**。

大模型在训练阶段（Fine-tuning）就已经被专门强化过：**当检测到请求中包含工具定义时，模型会尝试生成符合该 JSON Schema 的参数，而不是生成自然语言回复。**

### 为什么它比正则更可靠？

1. **专用输出通道**：模型会输出一个特定的 `tool_calls` 字段，这个字段在协议层面就是结构化的，避开了自然语言的干扰。
2. **Schema 约束**：模型在生成每一个 Token 时，都会受到 Schema 的约束。如果 Schema 要求某个字段是 `number`，模型生成非数字字符的概率会大幅降低。
3. **自动重试机制**：LangChain 内部甚至可以配置重试逻辑，如果模型第一次输出的 JSON 不合法，它会自动把错误信息反馈给模型进行修正。

## 流程对比：正则 vs 原生工具调用

我们可以通过下面的流程图直观地看到两者的差异：

````mermaid
graph TD
    subgraph "传统方案：正则提取 (局限性较大)"
    A1[Prompt: '请输出 JSON...'] --> B1[LLM 生成原始文本]
    B1 --> C1["文本内容: '好的，JSON 如下: ```json {...} ```'"]
    C1 --> D1[正则表达式匹配]
    D1 --> E1[JSON.parse 反序列化]
    E1 --> F1[手动类型检查/断言]
    F1 --> G1[最终业务对象]
    end

    subgraph "现代方案：Native Tool Calling (稳定且强类型)"
    A2[Prompt + JSON Schema] --> B2[LLM 内部逻辑约束生成]
    B2 --> C2[结构化 Tool Call 输出]
    C2 --> D2[LangChain 自动解析]
    D2 --> E2[Zod 运行时校验]
    E2 --> G2[强类型 TypeScript 对象]
    end

    style A2 fill:#e1f5fe,stroke:#01579b
    style G2 fill:#e8f5e9,stroke:#2e7d32
    style D1 fill:#ffebee,stroke:#c62828
````

## Zod：连接 TypeScript 与 LLM 的桥梁

在 LangChain.js 中，Zod 扮演了“翻译官”的角色。

### 从 TS 类型到 JSON Schema

LLM 并不认识 TypeScript，它只认识 JSON Schema。而我们作为开发者，更希望在代码中使用强类型的 Zod。

当你定义一个 Zod Schema 时：

1. **开发者视角**：你获得了一个可以进行运行时校验 and 类型推断的工具。
2. **LangChain 视角**：它利用 `zod-to-json-schema` 库，将你的 Zod 定义实时转换成 LLM 能够理解的 JSON Schema 描述。
3. **LLM 视角**：它接收到了一个严谨的结构定义，包含了字段名、类型、枚举值以及描述信息。

这种“一次定义，多处复用”的模式，实现了 **Single Source of Truth (单一事实来源)**，极大地降低了前后端协议不一致的风险。

## 实战案例：生成结构化学习计划

在我们的学习项目中，我们需要 AI 输出包含标题、描述、周计划列表等字段的复杂对象。

首先，定义协议：

```typescript
// packages/shared/src/study-plans.ts
import { z } from "zod";

export const StudyPlanContentSchema = z.object({
  title: z.string().describe("学习计划的总标题"),
  description: z.string().describe("学习计划的整体描述"),
  estimatedWeeks: z.number().describe("完成整个计划所需的预估周数"),
  weeklyPlan: z
    .array(
      z.object({
        week: z.number(),
        title: z.string(),
        tasks: z.array(z.string()),
      }),
    )
    .describe("按周划分的具体学习内容"),
});

export type StudyPlanContent = z.infer<typeof StudyPlanContentSchema>;
```

接着，在 Service 中使用：

```typescript
// apps/server/src/modules/agent/services/agent.plan.service.ts
@Injectable()
export class AgentPlanService {
  async generatePlan(
    goal: string,
    preferences: string,
  ): Promise<StudyPlanContent> {
    const prompt = `用户想学习: ${goal}，偏好是: ${preferences}`;

    // 关键一步：通过 .withStructuredOutput 绑定 Schema
    // 此时 model 的类型已经被增强，invoke 的返回结果直接就是 StudyPlanContent
    const model = this.agentProviderService
      .getModel(0.5)
      .withStructuredOutput(StudyPlanContentSchema);

    try {
      const initialPlan = await model.invoke(prompt);

      // 不需要正则，不需要 JSON.parse，直接读取字段，且有完整的 IDE 补全
      console.log(`生成计划: ${initialPlan.title}`);
      return initialPlan;
    } catch (error) {
      console.error("结构化输出失败:", error);
      throw error;
    }
  }
}
```

## 进阶技巧：利用 `.describe()` 引导 AI

在上面的 Schema 定义中，你会看到很多 `.describe()` 方法。这在传统的表单校验中可能只是注释，但在 AI 开发中，它是 **Prompt Engineering 的一部分**。

这些描述文字会被放入生成的 JSON Schema 的 `description` 字段中。LLM 在生成数据时会阅读这些描述。例如：

- `z.string().describe('标题风格设定')`
- `z.number().min(1).max(10).describe('难度等级')`

通过这种方式，你可以在不修改主 Prompt 的情况下，精细化控制每一个字段的生成逻辑。

## 总结

对于追求工程化质量的 AI 应用来说，`.withStructuredOutput` 是核心组件。

1. **确定性**：将概率性的文本生成转化为确定性的结构化数据。
2. **生产力**：告别正则清洗逻辑，节省大量调试时间。
3. **类型安全**：Zod 与 TypeScript 的深度集成，让 AI 输出的数据像本地函数调用一样可靠。

如果你还在为“如何让 AI 只输出 JSON”而面临挑战，请采用 Native Tool Calling。
