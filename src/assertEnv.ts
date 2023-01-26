import { exec } from 'child_process';

export const checkEnv = {
  ifWindowsShouldShellIsBash: async () => {
    console.log('process.env.SHELL', process.env.SHELL);
    if (process.platform === 'win32') {
      if (!process.env.SHELL?.includes('bash')) {
        throw new Error('윈도우 환경에서는 깃 배시 쉘을 통해 실행되어야함');
      }
    }
  },

  // shouldJavaInstalled: () => {
  //   exec('java -version', (error, stdout, stderr) => {
  //     if (error) {
  //       console.log('error', error);
  //       throw new Error('자바가 설치되어 있지 않음');
  //     }
  //     if (stderr) {
  //       console.log('stderr', stderr);
  //       throw new Error('자바가 설치되어 있지 않음');
  //     }
  //     console.log('stdout', stdout);
  //   });
  // },
  //
  // shouldPythonHomeIsSet: () => {
  //   if (!process.env.PYTHON_HOME) {
  //     console.log('process.env.PYTHON_HOME', process.env.PYTHON_HOME);
  //     throw new Error('PYTHON_HOME 환경변수가 설정되어 있지 않음');
  //   }
  // },
};
