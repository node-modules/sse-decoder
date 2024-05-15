import { strict as assert } from 'node:assert';
import { describe, it, beforeAll, afterAll, afterEach, beforeEach } from 'vitest';
import { Stream } from '../src';
import { DEFAULT_TEST_URL, createStreamMockServer } from './utils/mock-server';
import openaiChatCompletionChunks from './fixtures/openai-completion.json';

const server = createStreamMockServer([
  {
    url: `${DEFAULT_TEST_URL}/v1/chat/completions`, // imaging this is a real openai api endpoint
    chunks: openaiChatCompletionChunks,
    formatChunk: chunk => `data: ${JSON.stringify(chunk)}\n\n`,
    suffix: 'data: [DONE]',
  },
]);

describe('index.test.ts', () => {
  beforeAll(() => {
    server.listen();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  afterAll(() => {
    server.close();
  });

  it('should parse SSE Response', async () => {
    const controller = new AbortController();
    const response = await fetch(`${DEFAULT_TEST_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    });
    
    const parsedStream = Stream.fromSSEResponse(response as any, controller);
    const reader = parsedStream.toReadableStream().getReader();
    
    const decoder = new TextDecoder();
    const chunks: string[] = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      chunks.push(decoder.decode(value));
    }

    assert.deepStrictEqual(chunks,  [
      "{\"id\":\"chatcmpl-9I7rM0vAt7elTnnVYeQ7oFPvdAxWF\",\"object\":\"chat.completion.chunk\",\"created\":1714107144,\"model\":\"gpt-3.5-turbo-0125\",\"system_fingerprint\":\"fp_3b956da36b\",\"choices\":[{\"index\":0,\"delta\":{\"role\":\"assistant\",\"content\":\"\"},\"logprobs\":null,\"finish_reason\":null}]}\n",
      "{\"id\":\"chatcmpl-9I7rM0vAt7elTnnVYeQ7oFPvdAxWF\",\"object\":\"chat.completion.chunk\",\"created\":1714107144,\"model\":\"gpt-3.5-turbo-0125\",\"system_fingerprint\":\"fp_3b956da36b\",\"choices\":[{\"index\":0,\"delta\":{\"content\":\"Hello\"},\"logprobs\":null,\"finish_reason\":null}]}\n",
      "{\"id\":\"chatcmpl-9I7rM0vAt7elTnnVYeQ7oFPvdAxWF\",\"object\":\"chat.completion.chunk\",\"created\":1714107144,\"model\":\"gpt-3.5-turbo-0125\",\"system_fingerprint\":\"fp_3b956da36b\",\"choices\":[{\"index\":0,\"delta\":{\"content\":\"!\"},\"logprobs\":null,\"finish_reason\":null}]}\n",
      "{\"id\":\"chatcmpl-9I7rM0vAt7elTnnVYeQ7oFPvdAxWF\",\"object\":\"chat.completion.chunk\",\"created\":1714107144,\"model\":\"gpt-3.5-turbo-0125\",\"system_fingerprint\":\"fp_3b956da36b\",\"choices\":[{\"index\":0,\"delta\":{\"content\":\" How\"},\"logprobs\":null,\"finish_reason\":null}]}\n",
      "{\"id\":\"chatcmpl-9I7rM0vAt7elTnnVYeQ7oFPvdAxWF\",\"object\":\"chat.completion.chunk\",\"created\":1714107144,\"model\":\"gpt-3.5-turbo-0125\",\"system_fingerprint\":\"fp_3b956da36b\",\"choices\":[{\"index\":0,\"delta\":{\"content\":\" can\"},\"logprobs\":null,\"finish_reason\":null}]}\n",
      "{\"id\":\"chatcmpl-9I7rM0vAt7elTnnVYeQ7oFPvdAxWF\",\"object\":\"chat.completion.chunk\",\"created\":1714107144,\"model\":\"gpt-3.5-turbo-0125\",\"system_fingerprint\":\"fp_3b956da36b\",\"choices\":[{\"index\":0,\"delta\":{\"content\":\" I\"},\"logprobs\":null,\"finish_reason\":null}]}\n",
      "{\"id\":\"chatcmpl-9I7rM0vAt7elTnnVYeQ7oFPvdAxWF\",\"object\":\"chat.completion.chunk\",\"created\":1714107144,\"model\":\"gpt-3.5-turbo-0125\",\"system_fingerprint\":\"fp_3b956da36b\",\"choices\":[{\"index\":0,\"delta\":{\"content\":\" assist\"},\"logprobs\":null,\"finish_reason\":null}]}\n",
      "{\"id\":\"chatcmpl-9I7rM0vAt7elTnnVYeQ7oFPvdAxWF\",\"object\":\"chat.completion.chunk\",\"created\":1714107144,\"model\":\"gpt-3.5-turbo-0125\",\"system_fingerprint\":\"fp_3b956da36b\",\"choices\":[{\"index\":0,\"delta\":{\"content\":\" you\"},\"logprobs\":null,\"finish_reason\":null}]}\n",
      "{\"id\":\"chatcmpl-9I7rM0vAt7elTnnVYeQ7oFPvdAxWF\",\"object\":\"chat.completion.chunk\",\"created\":1714107144,\"model\":\"gpt-3.5-turbo-0125\",\"system_fingerprint\":\"fp_3b956da36b\",\"choices\":[{\"index\":0,\"delta\":{\"content\":\" today\"},\"logprobs\":null,\"finish_reason\":null}]}\n",
      "{\"id\":\"chatcmpl-9I7rM0vAt7elTnnVYeQ7oFPvdAxWF\",\"object\":\"chat.completion.chunk\",\"created\":1714107144,\"model\":\"gpt-3.5-turbo-0125\",\"system_fingerprint\":\"fp_3b956da36b\",\"choices\":[{\"index\":0,\"delta\":{\"content\":\"?\"},\"logprobs\":null,\"finish_reason\":null}]}\n",
      "{\"id\":\"chatcmpl-9I7rM0vAt7elTnnVYeQ7oFPvdAxWF\",\"object\":\"chat.completion.chunk\",\"created\":1714107144,\"model\":\"gpt-3.5-turbo-0125\",\"system_fingerprint\":\"fp_3b956da36b\",\"choices\":[{\"index\":0,\"delta\":{},\"logprobs\":null,\"finish_reason\":\"stop\"}]}\n"
    ]);
  });
});
