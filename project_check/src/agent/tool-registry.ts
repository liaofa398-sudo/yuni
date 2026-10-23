import type { ToolRiskLevel, PPTResult, SlideData } from '../types.ts';

export interface ToolDefinition<TArgs = any, TResult = any> {
  name: string;
  description: string;
  riskLevel: ToolRiskLevel;
  inputSchema: Record<string, any>;
  execute: (args: TArgs) => Promise<TResult>;
}

class ToolRegistry {
  private tools: Map<string, ToolDefinition> = new Map();

  registerTool<TArgs, TResult>(tool: ToolDefinition<TArgs, TResult>) {
    this.tools.set(tool.name, tool);
  }

  getTool(name: string): ToolDefinition | undefined {
    return this.tools.get(name);
  }

  listTools(): ToolDefinition[] {
    return Array.from(this.tools.values());
  }

  canExecute(toolName: string, confirmedByUser = false): { allowed: boolean; reason?: string } {
    const tool = this.tools.get(toolName);
    if (!tool) {
      return { allowed: false, reason: `未找到工具: ${toolName}` };
    }

    if (tool.riskLevel === 'L4') {
      return { allowed: false, reason: '安全拦截：禁止执行系统级危险或支付类操作。' };
    }

    if (tool.riskLevel === 'L3' && !confirmedByUser) {
      return { allowed: false, reason: 'L3 敏感操作需要用户明确确认。' };
    }

    return { allowed: true };
  }
}

export const toolRegistry = new ToolRegistry();

// 1. First Core Tool: create_ppt (L1: Create file/presentation, allowed by default)
export interface CreatePPTArgs {
  topic: string;
  style?: 'formal' | 'lively' | 'creative';
  targetSlides?: number;
}

export function generateDefaultSlides(topic: string, count = 6, style: 'formal' | 'lively' | 'creative' = 'lively'): SlideData[] {
  const slides: SlideData[] = [
    {
      slideNumber: 1,
      title: topic,
      subtitle: `由「予你」AI 陪伴工作体精心策划与生成 · ${style === 'formal' ? '商务汇报版' : '现代灵动版'}`,
      points: [
        '主讲人 / 呈现：予你 AI 智伴空间',
        '核心议题深度聚焦',
        `生成时间：${new Date().toLocaleDateString('zh-CN')}`,
      ],
      layout: 'cover',
      notes: '开场白：感谢大家的时间。今天我们将围绕本主题展开多维度的拆解与前瞻探讨。',
    },
    {
      slideNumber: 2,
      title: '目录与演进脉络',
      subtitle: 'Table of Contents',
      points: [
        '01. 核心背景与时代契机',
        '02. 关键驱动要素与机制解析',
        '03. 现状挑战与典型痛点剖析',
        '04. 实践方案与落地路径',
        '05. 未来展望与战略启示',
      ],
      layout: 'bullets',
      notes: '纲要说明：本汇报遵循从宏观趋势到微观落地的逻辑链条，层层递进。',
    },
    {
      slideNumber: 3,
      title: '核心背景与时代契机',
      subtitle: 'Background & Driving Forces',
      points: [
        `聚焦${topic}的爆发式发展与行业变革`,
        '技术范式加速演进，生产力效能迎来结构性跃迁',
        '市场生态重塑，用户体验与沉浸式场景成为核心壁垒',
      ],
      layout: 'split',
      notes: '重点突出：这不是偶发性热点，而是底层生产关系变革带来的必然浪潮。',
    },
    {
      slideNumber: 4,
      title: '关键机制与架构解析',
      subtitle: 'Mechanisms & Core Architecture',
      points: [
        '端到端闭环：从需求捕获、智能决策到自动化落地',
        '数据与知识飞轮：持续沉淀交互记忆，构建差异化壁垒',
        '敏捷协同体系：人机协同的新范式，赋予个体超级组织效能',
      ],
      layout: 'bullets',
      notes: '此页需结合实际业务链路展开，强调人机协同与闭环效应。',
    },
    {
      slideNumber: 5,
      title: '落地实践与行动策略',
      subtitle: 'Execution & Roadmap',
      points: [
        '第一阶段（破局）：轻量敏捷验证，跑通核心 MVP 闭环',
        '第二阶段（深耕）：构建稳定服务底座，强化长期记忆与工具生态',
        '第三阶段（绽放）：规模化辐射，赋能多终端全场景陪伴',
      ],
      layout: 'split',
      notes: '行动纲领：小步快跑，以真实体验为导向，拒绝空中楼阁。',
    },
    {
      slideNumber: 6,
      title: '总结展望与问答交流',
      subtitle: 'Summary & Q&A',
      points: [
        '科技给予力量，温度陪伴左右',
        `愿这份关于【${topic}】的呈现能为你带来启发与沉淀`,
        '诚挚感谢您的聆听，期待与您深入交流！',
      ],
      layout: 'summary',
      notes: '结束致辞：感谢大家的倾听，接下来进入问答与互动环节。',
    },
  ];

  return slides.slice(0, Math.max(4, Math.min(count, 10)));
}

toolRegistry.registerTool<CreatePPTArgs, PPTResult>({
  name: 'create_ppt',
  description: '根据用户给定的主题、风格与页数要求，规划幻灯片大纲、生成逐页内容并导出演示文稿',
  riskLevel: 'L1',
  inputSchema: {
    type: 'object',
    properties: {
      topic: { type: 'string', description: 'PPT演示主题' },
      style: { type: 'string', enum: ['formal', 'lively', 'creative'], description: '幻灯片风格' },
      targetSlides: { type: 'number', description: '目标幻灯片页数' },
    },
    required: ['topic'],
  },
  execute: async (args) => {
    const topic = args.topic.trim();
    const style = args.style || 'lively';
    const targetSlides = args.targetSlides || 6;

    // Simulate multi-step processing time for realism
    const slides = generateDefaultSlides(topic, targetSlides, style);

    return {
      id: `ppt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      topic,
      style,
      slideCount: slides.length,
      slides,
      createdAt: Date.now(),
    };
  },
});
