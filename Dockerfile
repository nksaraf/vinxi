FROM imbios/bun-node AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
COPY . /repo
WORKDIR /repo
RUN pnpm install --frozen-lockfile
RUN pnpm run build

WORKDIR /repo/packages/vinxi

EXPOSE 3000

CMD [ "/repo/packages/vinxi/bin/cli.mjs", "run", "/script.tsx" ]
