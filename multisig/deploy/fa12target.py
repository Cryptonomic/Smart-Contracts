import smartpy as sp
#KT1K9h6DDBcHL37R7BZvBUfSgJRPw7rpnpJR

CFA12 = sp.io.import_script_from_url("file:multisigFA12.py")
sp.add_compilation_target("FA12_multisig", CFA12.MultiSigWallet(signer = sp.address("tz1PybXTrD4sdQnTVzbZsX6Qr3QMQwNN2esZ")))
