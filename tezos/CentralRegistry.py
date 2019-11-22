import smartpy as sp

class CentralRegistry(sp.Contract):
    
    def __init__(self, value):
        self.init(domains = {})
        #dom = {domain : {key, resolver, ownerOfDomain, ttl}}
    
    def createSubdomain(params):
        subdomain = {}
        subdomain.key = params.key
        subdomain.resolver = params.resolver
        subdomain.ownerOfDomain = params.ownerOfDomain
        subdomain.ttl = params.ttl
        return {params.domain: subdomain}
        
    def getDomainFromObject(self, domainObject):
        return list(domainObject.keys())[0]
        
    def getValueFromObject(self, domainObject):
        return list(domainObject.values())[0]
        
    def checkDomain(self, domain):
        return domain in map(getDomainFromObject, self.domains)
        
    def getDomainFromSetMapping(self, domain):
        if checkDomain(self, domain):
            return self.domains[]
        else:
            throw ValueException("'domain' not registered")
        
    @sp.entryPoint    
    def createDomain(self, params):
        if not params:
            raise ValueError("Please specify 'key', 'resolver', 'domain', 'ownerOfDomain', 'ttl'")
        
        if checkDomain(self, createSubdomain(params)):
            raise Exception("Your domain is already taken")
            #how to raise exception properly
            
        labels = params.domain.split('.')
        
        domainAccumulator = null
        subdomains = {}
        
        for label in labels:
            if not domainAccumulator:
                domainAccumulator = label
            else:
                domainAccumulator = domainAccumulator + '.' + label
            subdomains.add(domainAccumulator)
            
        domains = {}    
            
        for domain in subdomains:
            if checkDomain(self, domain):
                continue
            subdomain = createSubdomain(params.key, params.resolver, domain, params.ownerOfDomain, params.ttl)
            key = getDomainFromObject(subdomain)
            value = getValueFromObject(subdomain)
            subdomain[key] = value
            
        return domain
    
    @sp.entryPoint
    def updateTtl(self, params):
        if checkDomain(self, createSubdomain(params)):
            self.domains[params.domain].ttl = params.ttl 
        
    @sp.entryPoint
    def relinquishSubdomain(self, params):
        if checkDomain(self, params.domain):
            self.domains[params.subdomain].ownerOfDomain = null
            
