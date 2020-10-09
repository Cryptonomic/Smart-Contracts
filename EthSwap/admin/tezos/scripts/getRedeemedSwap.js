const { ConseilDataClient } = require("conseiljs");
const init = require("../init");

const network = "carthagenet";

const conseilServer = {
  url: "https://conseil-dev.cryptonomic-infra.tech:443",
  apiKey: "1e2ca8b9-fb0b-4d78-ab8c-d5b67cc40434",
  network,
};

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

const getReedemedSwap = async () => {
  await init();
  const data = await ConseilDataClient.executeEntityQuery(
    conseilServer,
    "tezos",
    network,
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
  let swaps = [];
  data.forEach((e) => {
    swaps.push(parseValue(e));
  });
  return swaps;
};

getReedemedSwap().then(console.log);
