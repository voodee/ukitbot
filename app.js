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
var bot = new builder.UniversalBot(connector, session => {
    const msg = 'Я не понимаю чего вы от меня хотите :(\n\n';
    switch (Math.floor(Math.random() * 10) + 1 ) {
        case 1:
            session.send(msg + 'Но могу показать жопу...');
            session.beginDialog('ass');
            break;
        case 2:
            session.send(msg + 'Но могу показать сиськи...');
            session.beginDialog('tits');
            break;
        default:
            session.send(msg + 'Но могу поделиться цитатой...');
            session.beginDialog('quote');
            break;
    }
});
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


bot.dialog('ass', session => {
    gis('women ass erotic wallpaper jpg', (error, results) => {
        if (!error && results.length) {
            try {
                const img = results[ Math.floor(Math.random() * results.length) ]
                const msg = new builder.Message(session)
                    .addAttachment({
                        contentUrl: img.url,
                        contentType: 'image/jpg',
                        name: 'ass.jpg'
                    });
    
                session.endDialog(msg);
            } catch (e) {
                session.send('Что-то пошло не так(');
                session.endDialog(e);
            }
        } else {
            session.send('Что-то пошло не так(');
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
            session.endDialog('Что-то пошло не так(');
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

bot.dialog('quote', session => {
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




const axios = require('axios');
const numeral = require('numeral');

const getTokens = async () => {
    const { data } = await axios.get('https://token.ukit.com', {
        headers: {
            Cookie: "_ym_uid=1511550839989041042; _ceg.s=p08xly; _ceg.u=p08xly; _ga=GA1.2.729670054.1511550839; _gid=GA1.2.1760284050.1519845798; _ym_isad=1; _ym_visorc_47254833=w; _ym_visorc_46403016=w; firstReferrer=https%3A%2F%2Fico.ukit.com%2Fru; lastReferrer=https%3A%2F%2Fico.ukit.com%2Fru; ipp_uid2=Z63g6GEcmcsTSgiH/bNy1PTqxQFFzpD3nPn2IkA==; ipp_uid1=1519845801551; rerf=AAAAAFqXAaodWLHmA1g7Ag==; _ga=GA1.3.729670054.1511550839; _gid=GA1.3.1760284050.1519845798; mf_user=0de8d55eae1dade616fe8c55ba48a7ab|; sID=eyJzZXNzaW9uSWQiOiI1YTk3MDFjMDQwYzQzZjM4YmQzODczMmQiLCJlbWFpbCI6ImVlZG9vdkBnbWFpbC5jb20ifQ; sID.sig=rB8x94aISkVynabzjPT_KHZe3JA; csrfToken=046e5e18a25bcd1d4ccf823dd9a75b37e3c7b496a3fd14fa836defa8c0f2ab5c; _uetsid=_uet24fee3a0; mf_13b8fd66-a333-46f1-bdc4-554dcc08ef14=5c2f072f7f7fc0801a11d313d3553395|022827709496e0f608bfbe2d7d0ef378ada47bfa|1519845961714||2|||0|14.27"
        }
    })
    const
        all = 550000000,
        rest = ~~/remainingTokensByPhase":"(\d+)"/.exec(data)[1],
        sales = all - rest,
        salesPercent = (100/all)*sales

    return {all, rest, sales, salesPercent}
}

bot.dialog('token', async (session) => {
    const {all, rest, sales, salesPercent} = await getTokens()
    session.endDialog(`Продано **${numeral(salesPercent).format('0.00')}%**\n\n*${numeral(sales).format('0,0')}* из *${numeral(all).format('0,0')}* токенов`)
}).triggerAction({
    matches: /токен|token/i
})




bot.dialog('subscribeToken', session => {
    const address = session.message.address;
    var task = {
        PartitionKey: entGen.String('subscribeTokenTasks'),
        RowKey: entGen.String(address.conversation.id),
        address: JSON.stringify(address),
    };

    tableSvc.retrieveEntity('address', 'subscribeTokenTasks', address.conversation.id, (error, result, response) => {
        if (error) {
            tableSvc.insertEntity('address', task, (error, result, response) => {
                if (!error) {
                    session.endDialog('Теперь вы будете получать уведомления о продаже токенов!')
                } else {
                    session.endDialog('что-то пошло не так(')
                }
            })
        } else {
            session.endDialog('Вы уже подписаны на уведомления о продаже токенов.')
        }
    })
}).triggerAction({
    matches: /subscribeToken/i
});

bot.dialog('deSubscribeToken', session => {
    const address = session.message.address;
    const task = {
        PartitionKey: entGen.String('subscribeTokenTasks'),
        RowKey: entGen.String(address.conversation.id)
    }

    tableSvc.deleteEntity('address', task, (error, response) => {
        if (!error) {
            session.endDialog('Теперь вы НЕ будете получать уведомления о продаже токенов!')
        } else {
            session.endDialog('что-то пошло не так(')
        }
    })
}).triggerAction({
    matches: /deSubscribeToken/i
});

(async function() {
    let tokenCount = (await getTokens()).sales
    setInterval(async () => {
        const tokenCountNew = (await getTokens()).sales
        const tokenCountDiff = tokenCountNew - tokenCount
        if (tokenCountDiff < 1) return
        tokenCount = tokenCountNew
        const query = new azure.TableQuery()
            .top(5)
            .where('PartitionKey eq ?', 'subscribeTokenTasks');

        tableSvc.queryEntities('address',query, null, (error, result, response) => {
            if (!error) {
                result.entries.map(entry => {
                    const msg = new builder.Message().address(JSON.parse(entry.address._))
                    msg.text(`Только что продали ${numeral(tokenCountDiff).format('0,0')} токенов`)
                    bot.send(msg)
                })
            }
        })
    }, 15*1000)
})()