import test from 'node:test';
import assert from 'node:assert/strict';
import { toolRegistry, generateDefaultSlides } from './tool-registry.ts';

test('tool registry registers create_ppt with L1 risk level', () => {
  const tool = toolRegistry.getTool('create_ppt');
  assert.ok(tool);
  assert.equal(tool.name, 'create_ppt');
  assert.equal(tool.riskLevel, 'L1');
});

test('tool registry canExecute permits L1 tools without explicit user confirmation', () => {
  const check = toolRegistry.canExecute('create_ppt', false);
  assert.equal(check.allowed, true);
});

test('tool registry rejects nonexistent tools', () => {
  const check = toolRegistry.canExecute('nonexistent_tool');
  assert.equal(check.allowed, false);
});

test('generateDefaultSlides produces structured slides with titles and layout', () => {
  const slides = generateDefaultSlides('人工智能发展史', 5, 'formal');
  assert.equal(slides.length, 5);
  assert.equal(slides[0].layout, 'cover');
  assert.ok(slides[0].title.includes('人工智能发展史'));
  assert.ok(slides[0].points.length > 0);
  assert.ok(slides[0].notes);
});
