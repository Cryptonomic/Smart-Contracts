import smartpy as sp

class SimpleMath(sp.Contract):
    def __init__(self):
        self.init(sum = 0)

    @sp.entryPoint
    def computeSum(self, params):
        self.data.sum = params.augend + params.addend

# Tests
@addTest(name = "Basic Test")
def test():
    # Instantiate the SimpleMath contract
    c1 = SimpleMath()
    # Show its representation
    html  = c1.fullHtml()
    setOutput(html)