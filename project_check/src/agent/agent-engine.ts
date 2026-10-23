import { toolRegistry } from './tool-registry.ts';
import type { AgentTask, PPTResult } from '../types.ts';

export interface IntentAnalysisResult {
  isTask: boolean;
  toolName?: 'create_ppt';
  extractedArgs?: {
    topic: string;
    style?: 'formal' | 'lively' | 'creative';
    targetSlides?: number;
  };
}

export function analyzeUserIntent(input: string): IntentAnalysisResult {
  const text = input.trim();
  if (!text) return { isTask: false };

  // Detect PPT-related creation request
  const pptRegex = /(?:帮我(?:做|写|生成|整)|做|写|制作|生成|来一份)(?:一个|一份|个)?(?:关于|有关)?(.+?)(?:的)?(?:(\d{1,2})页)?(?:ppt|幻灯片|演示文稿)/i;
  const match = text.match(pptRegex);

  if (match) {
    let topic = match[1]?.trim() || '';
    // Clean common prefixes
    topic = topic.replace(/^(关于|有关|一份|一个)/, '').trim();
    if (!topic || topic.length < 2) {
      topic = '未指定主题的综合演示文稿';
    }

    const targetSlides = match[2] ? parseInt(match[2], 10) : 6;
    let style: 'formal' | 'lively' | 'creative' = 'lively';
    if (text.includes('正式') || text.includes('商务') || text.includes('严谨')) {
      style = 'formal';
    } else if (text.includes('可爱') || text.includes('活泼') || text.includes('创意')) {
      style = 'creative';
    }

    return {
      isTask: true,
      toolName: 'create_ppt',
      extractedArgs: {
        topic,
        style,
        targetSlides: Math.min(10, Math.max(4, targetSlides)),
      },
    };
  }

  // Also catch simple "做一个关于xxx的ppt"
  if (text.toLowerCase().includes('ppt') && (text.includes('做') || text.includes('生成') || text.includes('制作'))) {
    const rawTopic = text
      .replace(/帮我/g, '')
      .replace(/做一个/g, '')
      .replace(/做份/g, '')
      .replace(/生成/g, '')
      .replace(/制作/g, '')
      .replace(/ppt/gi, '')
      .replace(/关于/g, '')
      .trim();

    return {
      isTask: true,
      toolName: 'create_ppt',
      extractedArgs: {
        topic: rawTopic || '精选主题演示文稿',
        style: 'lively',
        targetSlides: 6,
      },
    };
  }

  return { isTask: false };
}

export interface AgentExecutionUpdate {
  phase: 'planning' | 'generating' | 'completed' | 'failed';
  stepText: string;
  result?: PPTResult;
}

export async function executePPTAgentWorkflow(
  args: { topic: string; style?: 'formal' | 'lively' | 'creative'; targetSlides?: number },
  onProgress?: (update: AgentExecutionUpdate) => void
): Promise<AgentTask> {
  const taskId = `task_ppt_${Date.now()}`;

  // 1. Planning phase
  if (onProgress) {
    onProgress({
      phase: 'planning',
      stepText: '让我想想……正在分析主题与知识结构',
    });
  }

  // Artificial small delay so user feels the pet thinking and working
  await new Promise((r) => setTimeout(r, 600));

  // 2. Generating phase
  if (onProgress) {
    onProgress({
      phase: 'generating',
      stepText: `正在为【${args.topic}】规划大纲并撰写每一页要点……`,
    });
  }

  await new Promise((r) => setTimeout(r, 800));

  // 3. Execution via tool registry
  const tool = toolRegistry.getTool('create_ppt');
  if (!tool) {
    throw new Error('未注册 create_ppt 工具');
  }

  const pptResult: PPTResult = await tool.execute(args);

  const finalTask: AgentTask = {
    taskId,
    type: 'create_ppt',
    status: 'completed',
    currentStepText: '好了，给你！PPT 演示文稿已经制作完成啦~',
    pptResult,
  };

  if (onProgress) {
    onProgress({
      phase: 'completed',
      stepText: '好了，给你！PPT 演示文稿已经制作完成啦~',
      result: pptResult,
    });
  }

  return finalTask;
}
