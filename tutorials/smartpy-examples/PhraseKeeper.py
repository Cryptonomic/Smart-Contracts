import smartpy as sp

class PhraseKeeper(sp.Contract):
    def __init__(self, initialPhrase):
        self.init(phrase = initialPhrase)

    @sp.entryPoint
    def setPhrase(self, params):
        self.data.phrase = params.newPhrase

# Tests
@addTest(name = "Basic Test")
def test():
    # Instantiate the PhraseKeeper contract
    c1 = PhraseKeeper("Hello World")
    # Show its representation
    html  = c1.fullHtml()
    setOutput(html)