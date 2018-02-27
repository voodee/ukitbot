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


// var savedAddress = [];
// Create your bot with a function to receive messages from the user
var bot = new builder.UniversalBot(connector);
bot.set('storage', tableStorage);


bot.dialog('activateCiHooks', session => {
    const address = session.message.address;
    var task = {
        PartitionKey: entGen.String('addresstasks'),
        RowKey: entGen.String(address.conversation.id),
        address: JSON.stringify(address),
    };

    tableSvc.retrieveEntity('address', 'addresstasks', address.conversation.id, function(error, result, response){
        if(error){
            tableSvc.insertEntity('address', task, function (error, result, response) {
                if(!error){
                    session.endDialog('Поздравляем, подписка оформлена!');
                }
            });
        } else {
            session.endDialog('Подписка была оформлена ранее.');
        }
    });

}).triggerAction({
    matches: /activateCiHooks/i
});


bot.dialog('deploy', [
    session => {
        console.log('+++++++++++++++++++++++++++++++')
        builder.Prompts.number(session, "Хост?");
    },
    (session, results) => {
        console.log('results.response', results.response)
        session.endDialog("Конец");
    }
]).triggerAction({
    matches: /deploy/i
})


var gis = require('g-i-s');


bot.dialog('zopa', session => {
    gis('women ass erotic wallpaper jpg', (error, results) => {
        if (!error && results.length) {
            const img = results[ Math.floor(Math.random() * results.length) ]
            const msg = new builder.Message(session)
                .addAttachment({
                    contentUrl: img.url,
                    contentType: 'image/jpg',
                    name: 'ass.jpg'
                });

            session.endDialog(msg);
        } else {
            session.endDialog(error);
        }
    })
}).triggerAction({
    matches: /жопа|попа|ass/i
})

bot.dialog('tits', session => {
    gis('women tits erotic wallpaper jpg', (error, results) => {
        if (!error && results.length) {
            const img = results[ Math.floor(Math.random() * results.length) ]
            const msg = new builder.Message(session)
                .addAttachment({
                    contentUrl: img.url,
                    contentType: 'image/jpg',
                    name: 'boobs.jpg'
                });
            session.endDialog(msg);
        } else {
            session.endDialog(error);
        }
    })
}).triggerAction({
    matches: /сиськи|грудь|boobs|tits|knocker/i
})
// .cancelAction('cancelDeploy', "Отменено.", { 
//     matches: /отмена/i,
//     confirmPrompt: "Уверены?"
// })



const request = require('request');

bot.dialog('rrsgdgsdsdgsdgs', session => {
    request({
        headers: {'content-type' : 'application/x-www-form-urlencoded'},
        url: 'http://forismatic.com/api/1.0/',
        method: 'POST',
        body:    "method=getQuote&format=json&param=ms&lang=ru",
        json: true,
    }, function(error, response, body){
        console.log('msg',body)
        session.endDialog(`**${body.quoteAuthor || 'Кто-то'}** как-то сказал:\n\n${body.quoteText}`);
    });
}).triggerAction({
    matches: /цитата/i
})



server.get('/api/hook', (req, res, next) => {
    var query = new azure.TableQuery()
        .where('PartitionKey eq ?', 'addresstasks');

    tableSvc.queryEntities('address',query, null, function(error, result, response) {
        if(!error) {
            result.entries.map( entry => {
                var msg = new builder.Message().address( JSON.parse(entry.address._) );
                msg.text(req.query.text);
                bot.endDialog(msg);
            })
        }
    });
    
    res.send();
    return next();
});
