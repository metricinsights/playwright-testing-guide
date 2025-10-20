#!/usr/bin/env node
const fs = require('fs');
const { cac } = require('cac');
const { execSync } = require('child_process');
const prompts = require('prompts');

const cli = cac('run-test');

cli
  .command('[env] [file]', 'run tests with selected env and optionally a specific test file')
  .action(async (env, file) => {
    const cwd = process.cwd();
    const chalk = (await import('chalk')).default;

    const envFiles = fs
      .readdirSync(cwd, {
        withFileTypes: true,
      })
      .filter((value) => {
        return value.isFile() && value.name.startsWith('.env.');
      })
      .map((value) => {
        return {
          filename: value.name,
          envname: value.name.replace(/^\.env\./i, ''),
        };
      });

    const envFilesMap = envFiles.reduce((prev, curr) => {
      prev[curr.envname] = curr.filename;
      return prev;
    }, {});

    if (!(env && envFilesMap[env])) {
      if (env) {
        console.warn(
          `${chalk.yellow(`Config for env ${env} is not defined. Please verify if file ".env.${env}" exists`)}`,
        );
      }

      env = (
        await prompts(
          {
            name: 'value',
            type: 'select',
            message: 'Select environment:',
            choices: Object.entries(envFilesMap).map(([key]) => {
              return { value: key, title: key };
            }),
          },
          {
            onCancel: () => {
              console.log('Terminating...');
              process.exit(1);
            },
          },
        )
      ).value;
    }

    // If a file is not specified, prompt the user to select one or keep it as is
    if (!file) {
      const files = fs.readdirSync(cwd).filter((f) => f.endsWith('.spec.ts')); // or specify your file pattern
      const { selectedFile } = await prompts(
        {
          type: 'select',
          name: 'selectedFile',
          message: 'Select a file to run or skip to use default:',
          choices: [{ title: 'Run default command', value: null }, ...files.map((f) => ({ title: f, value: f }))],
        },
        {
          onCancel: () => {
            console.log('No file selected. Exiting...');
            process.exit(1);
          },
        },
      );

      // Use the selected file if one is chosen
      file = selectedFile || file;
    }

    // Construct the command with the selected file if provided
    try {
      const command = file
        ? `npx dotenv -e ${envFilesMap[env]} -c ${env} -- npm run test -- ${file}`
        : `npx dotenv -e ${envFilesMap[env]} -c ${env} -- npm run test`;

      execSync(command, { stdio: 'inherit' });
      process.exit(0);
    } catch (error) {
      process.exit(1);
    }
  });

cli.help();

cli.parse();
