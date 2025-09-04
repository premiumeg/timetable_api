module.exports = {
  apps: [
    {
      name: "timetable_api",
      script: "npm",
      args: "start",
      cwd: "/home/mlk/timetable_api", // <-- Next.js 프로젝트 루트 경로
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
