#~/smartpy-cli/SmartPy.sh compile welcome.py compiled
#KT1WYzvyfSBpv7MVw4gUGcpbSn6dRbz5REgH
import smartpy as sp

CFA2 = sp.io.import_script_from_url("file:multisigFA2.py")
sp.add_compilation_target("FA2_multisig", CFA2.MultiSigWallet(signer = sp.address("tz1PybXTrD4sdQnTVzbZsX6Qr3QMQwNN2esZ")))
