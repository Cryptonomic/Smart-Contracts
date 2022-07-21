import smartpy as sp
#KT1VLFm9JfCApUkqQS8YDijJAGN3JHJEGa73

FA2_NEW = sp.io.import_script_from_url("file:tests/template/fa2.py")

sp.add_compilation_target("FA2_comp", FA2_NEW.FA2(config = FA2_NEW.environment_config(),
                              metadata = sp.utils.metadata_of_url("https://example.com"),
                              admin = sp.address("KT1WYzvyfSBpv7MVw4gUGcpbSn6dRbz5REgH")))