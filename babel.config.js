module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: [
      // Transform import.meta.env to process.env for web compatibility
      function () {
        return {
          visitor: {
            MetaProperty(path) {
              // import.meta.env.MODE → process.env.NODE_ENV
              if (
                path.parent.type === "MemberExpression" &&
                path.parent.property.type === "Identifier" &&
                path.parent.property.name === "env"
              ) {
                const grandParent = path.parentPath.parent;
                if (
                  grandParent &&
                  grandParent.type === "MemberExpression" &&
                  grandParent.property.type === "Identifier" &&
                  grandParent.property.name === "MODE"
                ) {
                  path.parentPath.parentPath.replaceWithSourceString(
                    'process.env.NODE_ENV'
                  );
                } else {
                  path.parentPath.replaceWithSourceString("process.env");
                }
              }
            },
          },
        };
      },
    ],
  };
};
