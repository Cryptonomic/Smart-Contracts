const { ConseilDataClient } = require("conseiljs");
const config = require("../../globalConfig.json");

const parseValue = (e) => {
  const splt = e.parameters.split(" ");
  return {
    ...e,
    parameters: {
      hashedSecret: splt[1],
      secret: splt[2],
    },
  };
};

module.exports = async (hashedSecret) => {
  const data = await ConseilDataClient.executeEntityQuery(
    config.tezos.conseilServer,
    "tezos",
    config.tezos.network,
    "operations",
    {
      fields: ["timestamp", "source", "parameters_entrypoints", "parameters"],
      predicates: [
        {
          field: "kind",
          operation: "eq",
          set: ["transaction"],
          inverse: false,
        },
        {
          field: "timestamp",
          operation: "after",
          set: [1597138153958],
          inverse: false,
        },
        { field: "status", operation: "eq", set: ["applied"], inverse: false },
        {
          field: "destination",
          operation: "eq",
          set: ["KT1T92mZgyZZtVqRG1XfyeqDsPbGe66tPFyV"],
          inverse: false,
        },
        {
          field: "parameters_entrypoints",
          operation: "eq",
          set: ["redeem"],
          inverse: false,
        },
      ],
      orderBy: [{ field: "timestamp", direction: "desc" }],
      aggregation: [],
      limit: 1000,
    }
  );
  for (let i = 0; i < data.length; ++i) {
    const swp = parseValue(data[i]);
    if (swp.parameters.hashedSecret == hashedSecret)
      return swp.parameters.secret;
  }
  return "";
};

// getReedemedSwap().then(console.log);
