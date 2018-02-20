/*-----------------------------------------------------------------------------
A simple echo bot for the Microsoft Bot Framework. 
-----------------------------------------------------------------------------*/

var restify = require('restify');
var builder = require('botbuilder');
var botbuilder_azure = require("botbuilder-azure");
var azure = require('azure-storage');
var tableSvc = azure.createTableService( 
    //process.env['AzureWebJobsStorage']
    'DefaultEndpointsProtocol=https;AccountName=ukita071;AccountKey=vyB2ujrNQQifWEew6NdES3XzjxmcC2MA5awsFV+Lm9sSGeNgY1GbqKLqxElHvhLbKoyTSGO6SvnTFK8BdD3ujA==;'
);
var entGen = azure.TableUtilities.entityGenerator;

tableSvc.createTableIfNotExists('address', function(error, result, response){
    
});


// Setup Restify Server
var server = restify.createServer();
server.use(restify.plugins.queryParser());
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});
  
// Create chat connector for communicating with the Bot Framework Service
// var connector = new builder.ChatConnector({
//     appId: process.env.MicrosoftAppId,
//     appPassword: process.env.MicrosoftAppPassword,
//     openIdMetadata: process.env.BotOpenIdMetadata 
// });
var connector = new builder.ChatConnector({
    appId: '8691488a-4b6f-463d-8042-90ea7d397678',
    appPassword: 'dE@6?ggy;I}*I6&$',
    openIdMetadata: process.env.BotOpenIdMetadata 
});

// Listen for messages from users 
server.post('/api/messages', connector.listen());

/*----------------------------------------------------------------------------------------
* Bot Storage: This is a great spot to register the private state storage for your bot. 
* We provide adapters for Azure Table, CosmosDb, SQL Azure, or you can implement your own!
* For samples and documentation, see: https://github.com/Microsoft/BotBuilder-Azure
* ---------------------------------------------------------------------------------------- */

var tableName = 'botdata';
// var azureTableClient = new botbuilder_azure.AzureTableClient(tableName, process.env['AzureWebJobsStorage']);
var azureTableClient = new botbuilder_azure.AzureTableClient(tableName, 'DefaultEndpointsProtocol=https;AccountName=ukita071;AccountKey=vyB2ujrNQQifWEew6NdES3XzjxmcC2MA5awsFV+Lm9sSGeNgY1GbqKLqxElHvhLbKoyTSGO6SvnTFK8BdD3ujA==;');
var tableStorage = new botbuilder_azure.AzureBotStorage({ gzipData: false }, azureTableClient);


var savedAddress = [];
// Create your bot with a function to receive messages from the user
var bot = new builder.UniversalBot(connector, session => {

    // if (!session.conversationData['hi']) {
    //     session.conversationData['hi'] = true;
    //     const address = session.message.address;
    //     session.send('Привет!')
    // }
    
    const address = session.message.address;
    if ( !savedAddress[address.channelId] ) {
        // savedAddress.push(address);

        var task = {
            PartitionKey: entGen.String('addresstasks'),
            RowKey: entGen.String(address.channelId),
            address: JSON.stringify(address),
        };

        tableSvc.retrieveEntity('address', 'addresstasks', address.channelId, function(error, result, response){
            if(error){
                tableSvc.insertEntity('address', task, function (error, result, response) {
                    if(!error){
                        session.send('Привет!');
                    }
                });
            }
        });


    }

});
bot.set('storage', tableStorage);

server.get('/api/hook', (req, res, next) => {
    // savedAddress.map( address => {
    //     var msg = new builder.Message().address(address);
    //     msg.text(req.query.text);
    //     bot.send(msg);

    // })
    var query = new azure.TableQuery()
        .where('PartitionKey eq ?', 'addresstasks');

    tableSvc.queryEntities('address',query, null, function(error, result, response) {
        if(!error) {
            result.entries.map( entry => {
                console.log('JSON.parse(entry.address._)', JSON.parse(entry.address._))
                var msg = new builder.Message().address( JSON.parse(entry.address._) );
                msg.text(req.query.text);
                bot.send(msg);
            })
        }
    });
    
    res.send();
    return next();
});

// bot.dialog('/', [
//     function (session) {
//         console.log('sad')
//         builder.Prompts.text(session, "Hello... What's your name?");
//     },
//     function (session, results) {
//         session.userData.name = results.response;
//         builder.Prompts.number(session, "Hi " + results.response + ", How many years have you been coding?"); 
//     },
//     function (session, results) {
//         session.userData.coding = results.response;
//         builder.Prompts.choice(session, "What language do you code Node using?", ["JavaScript", "CoffeeScript", "TypeScript"]);
//     },
//     function (session, results) {
//         session.userData.language = results.response.entity;
//         session.send("Got it... " + session.userData.name + 
//                     " you've been programming for " + session.userData.coding + 
//                     " years and use " + session.userData.language + ".");
//     }
// ]);
