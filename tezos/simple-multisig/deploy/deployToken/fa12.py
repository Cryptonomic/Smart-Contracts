import smartpy as sp
#KT1LXW98c6U1vefvS9HKeDW5umm4heSJCXJA

FA12_NEW = sp.io.import_script_from_url("file:tests/template/fa12.py")
token_metadata = {
        "decimals"    : "18",               # Mandatory by the spec
        "name"        : "My Great Token",   # Recommended
        "symbol"      : "MGT",              # Recommended
        # Extra fields
        "icon"        : 'https://smartpy.io/static/img/logo-only.svg'
    }
contract_metadata = {
    "" : "ipfs://QmaiAUj1FFNGYTu8rLBjc3eeN9cSKwaF8EGMBNDmhzPNFd",
}

sp.add_compilation_target("FA12_comp", FA12_NEW.FA12(
        sp.address("KT1PXkJx2RkhHMR3xCStN348LucdxrVUk8cf"),
        config              = FA12_NEW.FA12_config(support_upgradable_metadata = True),
        token_metadata      = token_metadata,
        contract_metadata   = contract_metadata
))