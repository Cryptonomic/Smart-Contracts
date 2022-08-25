import smartpy as sp
#KT1GBMmXFrJwJKK1EDtmmeTa4jTQ1EDFSX1L

FA2_NEW = sp.io.import_script_from_url("file:tests/template/fa2.py")

sp.add_compilation_target("FA2_comp", FA2_NEW.FA2(config = FA2_NEW.environment_config(),
                              metadata = sp.utils.metadata_of_url("https://example.com"),
                              admin = sp.address("KT1XQbcYE9ugoG4HEU5zndgXnCTx59cVa8gM")))