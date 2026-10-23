import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeUserIntent, executePPTAgentWorkflow } from './agent-engine.ts';

test('analyzeUserIntent recognizes PPT creation requests with topic and slide count', () => {
  const result = analyzeUserIntent('帮我做一个关于未来城市发展的8页PPT');
  assert.equal(result.isTask, true);
  assert.equal(result.toolName, 'create_ppt');
  assert.ok(result.extractedArgs?.topic.includes('未来城市发展'));
  assert.equal(result.extractedArgs?.targetSlides, 8);
});

test('analyzeUserIntent recognizes formal style modifier in PPT request', () => {
  const result = analyzeUserIntent('帮我做一份商务正式风格的AI大模型架构PPT');
  assert.equal(result.isTask, true);
  assert.equal(result.extractedArgs?.style, 'formal');
});

test('analyzeUserIntent passes standard chat messages as non-task', () => {
  const result = analyzeUserIntent('今天天气真好，你今天过得怎么样呀？');
  assert.equal(result.isTask, false);
});

test('executePPTAgentWorkflow generates complete task with structured slides', async () => {
  const task = await executePPTAgentWorkflow({
    topic: '低碳生活指南',
    style: 'lively',
    targetSlides: 5,
  });

  assert.equal(task.type, 'create_ppt');
  assert.equal(task.status, 'completed');
  assert.ok(task.pptResult);
  assert.equal(task.pptResult.topic, '低碳生活指南');
  assert.equal(task.pptResult.slides.length, 5);
});
