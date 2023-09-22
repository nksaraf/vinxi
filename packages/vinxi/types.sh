npx dts-buddy
sed -i '' '/declare module '\''vinxi\/runtime\/server'\'' {/a\
export * from "h3"
' types/index.d.ts