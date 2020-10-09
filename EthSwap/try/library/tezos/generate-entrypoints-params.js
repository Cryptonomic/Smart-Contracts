const { TezosContractIntrospector } = require("conseiljs");
const config = require("../../globalConfig.json");

module.exports = async () => {
  try {
    const ep = await TezosContractIntrospector.generateEntryPointsFromAddress(
      config.tezos.conseilServer,
      config.tezos.network,
      config.tezos.contractAddr
    );
    ep.forEach((p, i) => {
      console.log(
        `\n${i + 1}. ${p.name}(${p.parameters
          .map((pp) => (pp.name || "unnamed") + "/" + pp.type)
          .join(", ")})`
      );
      console.log(p.generateSampleInvocation());
    });
  } catch (err) {
    console.error(err);
  }
};
// GenParams();
