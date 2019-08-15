import smartpy as sp

class EventPlanner(sp.Contract):
    def __init__(self, initialOwner):
        self.init(owner = initialOwner,
                  nameToEvent = sp.Map())
                  
    @sp.entryPoint
    def setDate(self, params):
        sp.verify(sp.sender == self.data.owner)
        self.checkEvent(params.name)
        self.data.nameToEvent[params.name].date = params.newDate

    @sp.entryPoint
    def setNumGuests(self, params):
        sp.verify(sp.sender == self.data.owner)
        self.checkEvent(params.name)
        self.data.nameToEvent[params.name].numGuests = params.newNumGuests

    @sp.entryPoint
    def changeOwner(self, params):
        sp.verify(sp.sender == self.data.owner)
        self.data.owner = params.newOwner

    def checkEvent(self, name):
        sp.setType(name, str)
        sp.if ~(name in self.data.nameToEvent):
            self.data.nameToEvent[name] = sp.Record(date = "", numGuests = 0)

@addTest(name = "Advanced Test")
def test():
    # Create HTML output for debugging
    html = h1("Event Planner")
    
    # Initialize test addresses
    firstOwner = sp.address("firstOwner-address-1234")
    secondOwner = sp.address("secondOwner-address-5678")
    
    # Instantiate EventPlanner contract
    c1 = EventPlanner(firstOwner)
    
    # Print contract instance to HTML
    html += c1.fullHtml()
    
    # Invoke EventPlanner entry points and print results to HTML
    html += h2("Set date for Tezos Meetup to 11-28-2017")
    html += c1.setDate(name = "Tezos Meetup", newDate = "11-28-2017").run(sender = firstOwner).html()
    
    html += h2("Set number of guests for Tezos Meetup to 80")
    html += c1.setNumGuests(name = "Tezos Meetup", newNumGuests = 80).run(sender = firstOwner).html()
    
    html += h2("Change owner to steve")
    html += c1.changeOwner(newOwner = secondOwner).run(sender = firstOwner).html()
    
    html += h2("New owner sets date for Tezos Meetup to 03-21-2019")
    html += c1.setDate(name = "Tezos Meetup", newDate = "03-21-2019").run(sender = secondOwner).html()
    
    html += h2("Old owner attempts to set date for Tezos Meetup")
    html += c1.setDate(name = "Tezos Meetup", newDate = "10-15-2018").run(sender = firstOwner).html()
    
    # Output HTML to user interface
    setOutput(html)
    
    # Alternative output with alert boxes
    alert(str(c1.data.nameToEvent["Tezos Meetup"].date))
    
    # Verify expected results
    assert(str(c1.data.nameToEvent["Tezos Meetup"].date) == "'03-21-2019'")
    assert(int(c1.data.nameToEvent["Tezos Meetup"].numGuests) == 80)
    assert(str(c1.data.owner) == "address('secondOwner-address-5678')")