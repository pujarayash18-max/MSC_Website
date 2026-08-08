// Azure Resource Provisioning Bicep Template for Microsoft Campus Club (MCC) Platform
@description('Location for all resources')
param location string = resourceGroup().location

@description('Environment name (dev, staging, prod)')
param environment string = 'dev'

@description('App name prefix')
param appName string = 'mcc-platform'

var uniqueSuffix = uniqueString(resourceGroup().id)
var cosmosAccountName = '${appName}-cosmos-${uniqueSuffix}'
var blobStorageName = '${appName}st${uniqueSuffix}'
var signalRName = '${appName}-signalr-${uniqueSuffix}'
var appInsightsName = '${appName}-insights-${uniqueSuffix}'
var swaName = '${appName}-swa-${uniqueSuffix}'

// 1. Azure Cosmos DB Account (NoSQL)
resource cosmosAccount 'Microsoft.DocumentDB/databaseAccounts@2023-04-15' = {
  name: cosmosAccountName
  location: location
  kind: 'GlobalDocumentDB'
  properties: {
    databaseAccountOfferType: 'Standard'
    locations: [
      {
        locationName: location
        failoverPriority: 0
      }
    ]
    capabilities: [
      {
        name: 'EnableServerless'
      }
    ]
  }
}

resource cosmosDatabase 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases@2023-04-15' = {
  parent: cosmosAccount
  name: 'mccdb'
  properties: {
    resource: {
      id: 'mccdb'
    }
  }
}

// 2. Azure Blob Storage
resource storageAccount 'Microsoft.Storage/storageAccounts@2023-01-01' = {
  name: blobStorageName
  location: location
  sku: {
    name: 'Standard_LRS'
  }
  kind: 'StorageV2'
  properties: {
    accessTier: 'Hot'
    supportsHttpsTrafficOnly: true
    minimumTlsVersion: 'TLS1_2'
  }
}

resource blobService 'Microsoft.Storage/storageAccounts/blobServices@2023-01-01' = {
  parent: storageAccount
  name: 'default'
}

resource mediaContainer 'Microsoft.Storage/storageAccounts/blobServices/containers@2023-01-01' = {
  parent: blobService
  name: 'blob-storage'
  properties: {
    publicAccess: 'None'
  }
}

// 3. Azure SignalR Service (Serverless mode)
resource signalr 'Microsoft.SignalRService/signalR@2023-02-01' = {
  name: signalRName
  location: location
  sku: {
    name: 'Free_F1'
    capacity: 1
  }
  properties: {
    features: [
      {
        flag: 'ServiceMode'
        value: 'Serverless'
      }
    ]
  }
}

// 4. Azure Application Insights
resource appInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: appInsightsName
  location: location
  kind: 'web'
  properties: {
    Application_Type: 'web'
    RetentionInDays: 30
  }
}

// 5. Azure Static Web Apps
resource swa 'Microsoft.Web/staticSites@2022-09-01' = {
  name: swaName
  location: location
  sku: {
    name: 'Free'
    tier: 'Free'
  }
  properties: {}
}

output cosmosEndpoint string = cosmosAccount.properties.documentEndpoint
output blobStorageConnectionString string = 'DefaultEndpointsProtocol=https;AccountName=${storageAccount.name};AccountKey=${storageAccount.listKeys().keys[0].value};EndpointSuffix=core.windows.net'
output appInsightsConnectionString string = appInsights.properties.ConnectionString
output staticWebAppDefaultHostName string = swa.properties.defaultHostname
