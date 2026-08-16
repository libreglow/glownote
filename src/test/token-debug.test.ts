import { describe, it } from 'vitest';
import { tokenizeInline } from '../markdown/glowmark/editor/inline/tokenizer';

describe('tokenizer debug', () => {
  it('prints parse results', () => {
    for (const source of [
      '**hello**',
      '**hello** *world* ~~gone~~ `code`',
      'Hello **beautiful *world***',
    ]) {
      const { nodes, leaves } = tokenizeInline(source);
      console.log('SOURCE:', JSON.stringify(source));
      console.log('NODES:', JSON.stringify(nodes));
      console.log('LEAVES:', JSON.stringify(leaves));
    }
  });
});