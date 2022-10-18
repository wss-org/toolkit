import Engine, { IStepOptions } from '../src';
import { map } from 'lodash';
import * as path from 'path';
const logPrefix = path.join(__dirname, 'logs', '/tmp/uid/appname/releaseid');

describe('执行终态emit测试', () => {
  test('success', async () => {
    const steps = [
      { run: 'echo "hello"', id: 'xhello' },
      { run: 'echo "world"' },
    ] as IStepOptions[];
    const engine = new Engine({
      steps,
      logConfig: { logPrefix },
      events: {
        onSuccess: async function (data) {
          const newData = map(data, (item) => ({ run: item.run, status: item.status }));
          expect(newData).toEqual([
            { run: 'echo "hello"', status: 'success' },
            { run: 'echo "world"', status: 'success' },
          ]);
        },
      },
    });
    await engine.start();
  });
  test('completed', async () => {
    const steps = [
      { run: 'echo "hello"', id: 'xhello' },
      { run: 'echo "world"' },
    ] as IStepOptions[];
    const engine = new Engine({
      steps,
      logConfig: { logPrefix },
      events: {
        onCompleted: async function (data) {
          const newData = map(data, (item) => ({ run: item.run, status: item.status }));
          expect(newData).toEqual([
            { run: 'echo "hello"', status: 'success' },
            { run: 'echo "world"', status: 'success' },
          ]);
        },
      },
    });
    engine.on('completed', (data) => {
      const newData = map(data, (item) => ({ run: item.run, status: item.status }));
      expect(newData).toEqual([
        { run: 'echo "hello"', status: 'success' },
        { run: 'echo "world"', status: 'success' },
      ]);
    });
    await engine.start();
  });
  test('failure', async () => {
    const steps = [
      { run: 'echo "hello"', id: 'xhello' },
      { run: 'npm run error', id: 'xerror' },
    ] as IStepOptions[];
    const engine = new Engine({
      steps,
      logConfig: { logPrefix },
      events: {
        onFailure: async function (data) {
          const newData = map(data, (item) => ({ run: item.run, status: item.status }));
          expect(newData).toEqual([
            { run: 'echo "hello"', status: 'success' },
            { run: 'npm run error', status: 'failure' },
          ]);
        },
      },
    });
    await engine.start();
  });

  test('cancelled', (done) => {
    const lazy = (fn: any) => {
      setTimeout(() => {
        console.log('3s后执行 callback');
        fn();
      }, 3000);
    };
    const steps = [
      { run: 'echo "hello"' },
      { run: 'node packages/engine/__tests__/cancel-test.js' },
      { run: 'echo "world"' },
      { run: 'echo "end"', if: '${{ cancelled() }}' },
    ] as IStepOptions[];
    const engine = new Engine({
      steps,
      logConfig: { logPrefix },
      events: {
        onCancelled: async function (data) {
          const newData = map(data, (item) => ({ run: item.run, status: item.status }));
          expect(newData).toEqual([
            { run: 'echo "hello"', status: 'success' },
            {
              run: 'node packages/engine/__tests__/cancel-test.js',
              status: 'cancelled',
            },
            { run: 'echo "world"', status: 'cancelled' },
            { run: 'echo "end"', status: 'success' },
          ]);
        },
      },
    });
    const callback = jest.fn(() => {
      engine.cancel();
    });
    lazy(callback);
    engine.start();
    setTimeout(() => {
      expect(callback).toBeCalled();
      done();
    }, 3001);
  });
});

describe('步骤执行过程中emit测试', () => {
  test.only('uses success on process', async () => {
    const steps = [
      {
        uses: path.join(__dirname, 'fixtures', 'success'),
        id: 'xapp',
        inputs: { milliseconds: 10 },
      },
      { run: 'echo "world"', id: 'xworld' },
    ] as IStepOptions[];
    const newData: any = [];
    const engine = new Engine({
      steps,
      logConfig: { logPrefix },
      events: {
        async onProgress(data) {
          const obj: any = {
            status: data.status,
          };
          if (data.errorMessage) {
            obj['errorMessage'] = data.errorMessage;
          }
          if (data.outputs) {
            obj['outputs'] = data.outputs;
          }
          newData.push(obj);
        },
      },
    });
    await engine.start();
    expect(newData).toEqual([
      { status: 'success', outputs: { success: true } },
      { status: 'success', outputs: {} },
    ]);
  });
});
