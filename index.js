const express= require('express');
var mysql = require('mysql');
var bodyParser= require('body-parser');
var MySQLEvents = require('mysql-events');


// var con = mysql.createConnection({
//   host: "localhost",
//   user: "root",
//   password: "",
//   database: "hotelatlas",
//   port:3308,
//   multipleStatements: true
// });

var con = mysql.createConnection({
  host: "localhost",
  user: "hotelatlas",
  password: "Hotel@atlas123",
  database: "hotelatlas",
  multipleStatements: true
});
// var con = mysql.createConnection({
//   host: "localhost",
//   user: "root",
//   password: "",
//   port: 3308,
//   database:'hotelatlas',
//   multipleStatements: true
// });
// var newcon= {host: "localhost",
//   user: "root",
//   password: "",
//   port: 3308,
//   database:'hotelatlas'}
var path = require('path')
con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!"); 
  });


// mysqleventwatcher= MySQLEvents(newcon);
// console.log(mysqleventwatcher);


const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, 'public')));
// app.use(express.json());

app.get('/',function(req,res)
{
return res.redirect('/billing');
})

app.post('/createitem',function(req,res)
{
  console.log(req.body);
  var stockitementry=[req.body.formobj.itemsname];
  var itemdetails= [req.body.formobj.itemsname,req.body.formobj.itemalias,req.body.formobj.units,req.body.formobj.itemgroupcreate];

  var stockitementryfunction= () =>
  {
    return new Promise((resolve,reject)=>
    {
      var insertintostockitemtable= `INSERT INTO itemliststock(itemname) values ?`;
      con.query(insertintostockitemtable,[[stockitementry]],function(err,results)
      {
        if(err)
        {
          reject(new Error(err));
        }
        else
        {
          resolve(results);
        }
      })
    })
  }


  stockitementryfunction().then(function(results)
  {
  var insertintoitemtable= "INSERT INTO `itemtable`(`itemname`, `alias`, `units`, `itemgroup`) VALUES ?";
  con.query(insertintoitemtable,[[itemdetails]],function(err,result,fields)
  {
    if(err) 
    {

      console.log(err);
      res.status(500).send({'message':'Enter valid data'});
    }
    else
    {
      console.log("Submitted Successfully");
      res.status(200).send({'message':'Submitted Successfully'});
    }

  })
}).catch(function(err)
{
  console.log(err);
  res.status(500).send({'message':'Enter valid data'});


})
})

app.post('/searchstock',function(req,res)
{
console.log(req.body);
var returntable= (index) =>
{
  var stocktablelist= { 1:['itemgroupnametable','groupcategory'],2:['itemgroupnametable','itemgroupname'],3:['itemtable','itemname']}
  return stocktablelist[index];
}
var index=returntable(req.body.index);
// console.log("index is "+ index);
// // var searchby=req.body.searchby;
var senditem= req.body.senditem;

// var purchaseitem;
// var salesitem;
var returnitem= (indexes) =>{
return new Promise((resolve,reject)=>
{
if(Number(indexes)===0)
{
var getitem=`SELECT * FROM itemliststock inner join itemtable on itemliststock.itemname=itemtable.itemname inner join itemgroupnametable on itemtable.itemgroup=itemgroupnametable.itemgroupname `;
con.query(getitem,function(err,result,fields)
{
  if(err)
  {
    console.log(err);
    // res.status(500).send({'err':'No any item in the list'});
    reject(new Error("No any item found"));
  }
  else
  {
    console.log(result);

    // res.status(200).send({'result':result});
    resolve(result);

  }

})
}
else
{
var getitem=`SELECT * FROM itemliststock inner join itemtable on itemliststock.itemname=itemtable.itemname inner join itemgroupnametable on itemtable.itemgroup=itemgroupnametable.itemgroupname where ${index[0]}.${index[1]}='${senditem}'`;
con.query(getitem,function(err,result,fields)
{
  if(err)
  {
    console.log(err);
    // res.status(500).send({'err':'No any item in the list'});
    reject(new Error("No any item found"));
  }
  else
  {
    console.log(result);

    // res.status(200).send({'result':result});
    resolve(result);

  }

})
}
})

}

returnitem(req.body.index).then(function(results)
{
res.status(200).send({'result':results})
}).catch(function(err)
{
  console.log(err);
res.status(500).send(err);
})
})
app.get('/stock',function(req,res)
{
  var selectstock=`SELECT * from itemtable; SELECT * from itemgroupnametable;  SELECT * from groupcategory;
SELECT * from unittable`;
con.query(selectstock,function(err,result)
{
  res.render('pages/stock',{itemtable:result[0],itemgrouplist:result[1],itemcategorylist:result[2],unittable:result[3]});

})
})

app.post('/creategroup',function(req,res)
{
  console.log(req.body);
  var groupdetails= [req.body.formobj.groupname,req.body.formobj.groupcategory];
  var insertintogrouptable= "INSERT INTO `itemgroupnametable`(`itemgroupname`, `groupcategory`) VALUES ?";
  con.query(insertintogrouptable,[[groupdetails]],function(err,result,fields)
  {
    if(err) 
    {
      console.log(err);
      res.status(500).send({'message':'Enter valid data'});
    }
    else
    {
      console.log("Submitted Successfully");
      res.status(200).send({'message':'Submitted Successfully'});
    }

  })
})
app.post('/createcategory',function(req,res)
{
  console.log(req.body);
  var categorydetails= [req.body.formobj.categoryname];
  console.log(categorydetails);
  var insertintocategorytable= "INSERT INTO `groupcategory`(`categoryname`) VALUES ?";
  con.query(insertintocategorytable,[[[categorydetails]]],function(err,result,fields)
  {
    if(err) 
    {
      console.log(err);
      res.status(500).send({'message':'Enter valid data'});
    }
    else
    {
      console.log("Submitted Successfully");
      res.status(200).send({'message':'Submitted Successfully'});
    }

  })
})


app.get('/billing', function(req, res) {
    res.render('pages/billing');
});

// about page 
app.get('/voucher', function(req, res) {
  var accountquery = "SELECT * from groups; SELECT * from paymenttable;SELECT * from accountinformation;SELECT * from itemtable; SELECT * from itemgroupnametable;  SELECT * from groupcategory;SELECT * from paymenttable where vouchertype='Payment' order by transactionno DESC LIMIT 1;SELECT * from paymenttable where vouchertype='Receipt' order by transactionno DESC LIMIT 1;SELECT * from paymenttable where vouchertype='Contra' order by transactionno DESC LIMIT 1;SELECT * from paymenttable where vouchertype='Journal' order by transactionno DESC LIMIT 1; SELECT * from purchasedetails order by purchaseno DESC LIMIT 1;SELECT * from unittable;SELECT * from salesdetails order by salesno DESC LIMIT 1;";
    con.query(accountquery,function(err,results,fields)
    {
      console.log(err);
      // console.log(results[0]);
      // console.log(results[1]);

    // console.log(result.length);
    // if (err) throw err;
    // console.log(result[0].accountname);
    // console.log("Number of records inserted: " + result.affectedRows);
    // if(results[1].length===0)
    // {
    //   transactionno= 0;
    // }
    // else
    // {
    //   for(var i=0; i<results[1].length;i++)
    //   {
    //   transactionno= parseInt(results[1][i]['transactionno']);
    // }
    // }


    // console.log(transactionno+results[6]);
     res.render('pages/payment',{error:'',results:results[0],accountinformations:results[2],'itemtable':results[3],'itemgrouplist':results[4],'itemcategorylist':results[5],paymentno:results[6],'receiptno':results[7],'contrano':results[8],'journalno':results[9],'purchaseno':results[10],'unittable':results[11],'salesno':results[12]});
    }
    );
    // res.render('pages/payment',);
});

app.get('/reserve', function(req, res) {
    res.render('pages/reserve');
});
app.post('/accountsubmit',(req,res)=>
{
  // console.log(req.body.accountdataarray);
  console.log(req.body.formobj);

  var accountdata=[req.body.formobj];

  var length=accountdata[0].length;
  if(accountdata[0][length-2].length===0)
  {
accountdata[0][length-2]='1915-03-31';
accountdata[0][length-1]=0.00;
  }

  // paymentdata=paymentdata[0];
  // console.log(paymentdata);
  if(Number(accountdata[0][3]) >0 && Number(accountdata[0][3])<4)
  {
  var accountquery = "INSERT INTO accountinformation(accountname, alias, printname, accountgroup, address, country, telno, fax, mobileno, email, contactperson, panno,accountno,fiscalyear,amount) VALUES ? ";
    con.query(accountquery,[accountdata],function(err,result)
    {
    // if (err) throw err;
    console.log("Number of records inserted: " + result.affectedRows);
      res.json({'result':'Submitted'});
    });

}
else
{
    console.log("INserted here");

  console.log("Hello");
   var accountquery = "INSERT INTO accountinformation(accountname, alias, printname, accountgroup, address, country, telno, fax, mobileno, email, contactperson,panno,fiscalyear,amount) VALUES ? ";
    con.query(accountquery,[accountdata],function(err,result)
    {
    if (err) throw err;
    console.log("Number of records inserted: " + result.affectedRows);
      res.json({'result':'Submitted'});
    });
}
})
// app.get('/billings',(req,res)=>

// {
// res.sendFile(__dirname + '/public/billing.html');
// });
// app.get('/reserve',(req,res)=>

// {
// res.sendFile(__dirname + '/public/reserve1.html');
// });
app.post('/accountreturn',(req,res)=>
{
  console.log(req.body.a);
  var accountquery = "SELECT accountname from accountinformation where accountname like ? ";
    con.query(accountquery,'%' + req.body.a + '%',function(err,result,fields)
    {
    // console.log(result.length);
    // if (err) throw err;
    // console.log(result[0].accountname);
    // console.log("Number of records inserted: " + result.affectedRows);
    res.json({result});
    });
})

app.get('/daybookreturn',(req,res)=>
{
  console.log(req.body.a);
  // var accountquery = "SELECT * from paymenttable where paymentdate between ? and ? ";
  var accountquery = "SELECT dctype,account,dcamount,DATE_FORMAT(paymentdate,'%Y-%m-%d') as paymentdate,transactionno,narration from paymenttable";
  var accountquery1 = "SELECT account,SUM(dcamount) as total,dctype from paymenttable group by account,dctype";
  var totalcredit=0,totaldebit=0;

  


  con.query(accountquery1,function(err,results,fields)
    {
    // console.log(results.length);
    // console.log(results);
    for(var key in results)
    {
      // console.log("Key is "+key);
      if(results[key]['dctype']==='c')
    {
      totalcredit=totalcredit+results[key]['total'];
    }
    else
    {
      totaldebit=totaldebit+results[key]['total'];
    }
    }
  });

    // con.query(accountquery,[req.body.date1],[req.body.date2],function(err,result,fields)
  con.query(accountquery,function(err,result,fields)
    {
    var i=0;
    // var transactionno=[];
    var results={};
    const grouped = result.reduce((groups, cur) => {
      console.log(groups);
      console.log(cur);
    var key = cur.transactionno;
    // console.log(key);
    const key1=cur.paymentdate;
   // groups[key]={'1':(groups[key] || 0) + 1};
    groups[key] = (groups[key] || 0) + 1;



    return groups;
}, {});
    // console.log(grouped);
    // console.log(results);

// const totaltransaction = resulr.reduce((groups, cur) => {
//   console.log(groups);
//       console.log(cur);
// if(groups[cur.titles]==undefined)
// {
//   groups[cur.transactionno]=0;
// }
// const key = cur.transactionno;
    
// groups[key] = groups[key]+ 1;
// return groups;
// }, {});
    
const totaltransaction= Object.keys(grouped).map(key => ({transactionno: key, total: grouped[key]}));
console.log(totaltransaction);
    // for(i=1;i<result.length;i++)
    // {
    
    // }
    // var resulttable="<table><tr><th>S.N</th><th>Account Name</th><th>Debit</th><th>Credit</th></tr>";
    // for(i=1;i<result.length;i++)
    // {
    //  resulttable+=`<tr><td>${i}</td><td>result[i].account</td>`
    // }
    // // console.log(result.length);
    // // if (err) throw err;
    // // console.log(result[0].accountname);
    // // console.log("Number of records inserted: " + result.affectedRows);
    // console.log(result);
    res.render('pages/daybook',{results:result,totaltransaction:totaltransaction,totaldebit:totaldebit,totalcredit:totalcredit});
    });
});
app.get('/trialbalance',(req,res)=>
{
  var accountquery = "SELECT account,SUM(dcamount) as total,dctype from paymenttable group by account,dctype";
    con.query(accountquery,function(err,results,fields)
    {
    // console.log(results.length);
    // console.log(results);
    var totalcredit=0,totaldebit=0;
    for(var key in results)
    {
      // console.log("Key is "+key);
      if(results[key]['dctype']==='c')
    {
      totalcredit=totalcredit+results[key]['total'];
    }
    else
    {
      totaldebit=totaldebit+results[key]['total'];
    }
    }
    // console.log("Total amount"+totaldebit);
    // console.log("Total amount"+totalcredit);

    // if (err) throw err;
    // console.log(result[0].accountname);
    // console.log("Number of records inserted: " + result.affectedRows);
    res.render('pages/trialbalance',{results:results,totaldebit:totaldebit,totalcredit:totalcredit});
    });
});
app.post('/paymentsubmit',(req,res)=>
{
	// console.log(req.body.op);
	var paymenttabledata=[req.body.o];
  var paymentdetailsdata=[req.body.paymentdetails];
  console.log(paymenttabledata);
  console.log("Payment "+paymenttabledata[0]['dctype'].length);

  console.log(paymentdetailsdata);
	// paymentdata=paymentdata[0];
	// console.log(paymentdata);
  // var transactionno= paymentdata[0][5];


	var inser = "INSERT INTO paymenttable(dctype,account,dcamount,vouchertype,transactionno,paymentdate) VALUES ? ";
  var inser2= "INSERT INTO `paymentdetails`(`vouchertype`, `transactionno`, `debitamount`, `creditamount`, `date`,`narration` ) VALUES ?";


var insertpaymentdetails= () =>
{
  return new Promise((resolve,reject)=>
  {
    con.query(inser2,[paymentdetailsdata],function(err,result)
    {
      if(result=== undefined)
      {
        reject( new Error("Transaction no already in the list "));

      }
      else
      {
        resolve(result);
      }
    })

  })

  
}

insertpaymentdetails().then(function(results)
{
  console.log("INserted Successfully");
  for(i=0;i<paymenttabledata[0]['dctype'].length;i++)
{
    con.query(inser,[[[paymenttabledata[0]['dctype'][i],paymenttabledata[0]['accounttype'][i],paymenttabledata[0]['dcamount'][i],paymenttabledata[0]['transactiontitle'][i],paymenttabledata[0]['transactionno'][i],paymenttabledata[0]['paymentdate'][i]]]],function(err,result)
    {
      // console.log([paymentdata]);
    if (err) 
      {
        console.log(err);
      }
      else
      {
    // console.log("Number of records inserted: " + result.affectedRows);
console.log(result);
    
    }
    });
  }
  res.status(200).send("Transaction completed Successfully");
}).catch((err)=>
{
  console.log(err);
  res.status(500).send("Error in the transaction");

})



})
app.post('/purchasesubmit',(req,res)=>
{
  // console.log(req.body.op);
  var purchasetabledata=[req.body.o];
  var purchasedetailsdata=[req.body.purchasedetails];
  console.log(purchasetabledata);
  console.log("Payment "+purchasetabledata[0]['itemname'].length);

  console.log(purchasedetailsdata);
  // paymentdata=paymentdata[0];
  // console.log(paymentdata);
  // var transactionno= paymentdata[0][5];


  var inser = "INSERT INTO `purchasetable`(`itemname`, `quantity`, `rate`, `units`, `amount`, `purchaseno`, `purchasedate`) VALUES ? ";
  var inser2= "INSERT INTO `purchasedetails`(`purchaseno`, `accountname`, `totalamount`, `purchasedate`) VALUES ?";

var inser3="UPDATE itemliststock set `remaining`=`remaining`+? where itemname=? ";

var insertpurchasedetails= () =>
{
  return new Promise((resolve,reject)=>
  {
    con.query(inser2,[purchasedetailsdata],function(err,result)
    {
      if(result=== undefined)
      {
        reject( new Error("Transaction no already in the list "));

      }
      else
      {
        resolve(result);
      }
    })

  })

  
}

insertpurchasedetails().then(function(results)
{
return new Promise((resolve,reject)=>
{
  console.log("INserted Successfully");
  for(i=0;i<purchasetabledata[0]['itemname'].length;i++)
{
    con.query(inser,[[[purchasetabledata[0]['itemname'][i],purchasetabledata[0]['quantity'][i],purchasetabledata[0]['rate'][i],purchasetabledata[0]['units'][i],purchasetabledata[0]['amount'][i],purchasetabledata[0]['transactionno'][i],purchasetabledata[0]['purchasedate'][i]]]],function(err,result)
    {
      // console.log([paymentdata]);
    if (err) 
      {
        console.log(err);
        reject(new Error(err));
      }
      else
      {
    // console.log("Number of records inserted: " + result.affectedRows);
console.log(result);
resolve(result);
    
    }
    });
  }
  // res.status(200).send("Transaction completed Successfully");
})
}).then(function(results)
{
  return new Promise((resolve,reject)=>
{
  console.log("INserted Successfully");
  for(i=0;i<purchasetabledata[0]['itemname'].length;i++)
{
    con.query(inser3,[[purchasetabledata[0]['quantity'][i]],[purchasetabledata[0]['itemname'][i]]],function(err,result)
    {
      // console.log([paymentdata]);
    if (err) 
      {
        
        console.log(err);
        reject(new Error(err));      }
      else
      {
    // console.log("Number of records inserted: " + result.affectedRows);
console.log(result);
 res.status(200).send("Transaction completed Successfully");
resolve(result);

    
    }
    });
  }
 
})
}).catch((err)=>
{
  console.log(err);
  res.status(500).send("Error in the transaction");

})
})



app.post('/salessubmit',(req,res)=>
{
  // console.log(req.body.op);
  var salestabledata=[req.body.o];
  var salesdetailsdata=[req.body.salesdetails];
  console.log(salestabledata);
  console.log("Payment "+salestabledata[0]['itemname'].length);

  console.log(salesdetailsdata);
  // paymentdata=paymentdata[0];
  // console.log(paymentdata);
  // var transactionno= paymentdata[0][5];


  var inser = "INSERT INTO `salestable`(`itemname`, `quantity`, `rate`, `units`, `amount`, `salesno`, `salesdate`) VALUES ? ";
  var inser2= "INSERT INTO `salesdetails`(`salesno`, `accountname`, `totalamount`, `salesdate`) VALUES ?";
var inser3="UPDATE itemliststock set `remaining`=`remaining`-? where itemname=? ";


var insertsalesdetails= () =>
{
  return new Promise((resolve,reject)=>
  {
    con.query(inser2,[salesdetailsdata],function(err,result)
    {
      if(result=== undefined)
      {
        reject( new Error("Transaction no already in the list "));

      }
      else
      {
        resolve(result);
      }
    })

  })

  
}

insertsalesdetails().then(function(results)
{
  console.log("INserted Successfully");
  for(i=0;i<salestabledata[0]['itemname'].length;i++)
{
    con.query(inser,[[[salestabledata[0]['itemname'][i],salestabledata[0]['quantity'][i],salestabledata[0]['rate'][i],salestabledata[0]['units'][i],salestabledata[0]['amount'][i],salestabledata[0]['transactionno'][i],salestabledata[0]['salesdate'][i]]]],function(err,result)
    {
      // console.log([paymentdata]);
    if (err) 
      {
        console.log(err);
      }
      else
      {
    // console.log("Number of records inserted: " + result.affectedRows);
console.log(result);
    return result;

    }
    });
  }
}).then(function(results)
{
  return new Promise( (resolve,reject)=>
  {
console.log("INserted Successfully");
  for(i=0;i<salestabledata[0]['itemname'].length;i++)
{
    con.query(inser3,[[salestabledata[0]['quantity'][i]],[salestabledata[0]['itemname'][i]]],function(err,result)
    {
      // console.log([paymentdata]);
    if (err) 
      {
        
        console.log(err);
        reject(new Error(err));      }
      else
      {
    // console.log("Number of records inserted: " + result.affectedRows);
console.log(result);
 res.status(200).send("Transaction completed Successfully");
resolve(result);

    
    }
    });
  }
})
}).
catch((err)=>
{
  console.log(err);
  res.status(500).send("Error in the transaction");

})



})
app.post('/submitcontra',(req,res)=>
{
  // console.log(req.body.op);
  // var paymentdata=req.body.op;
  // paymentdata=paymentdata[0];
  // console.log(paymentdata);
  var contrafinaldata= req.body.contrafinaldata;
  console.log(contrafinaldata);
  var inser = "INSERT INTO contratable(bankname,accountno,accountgroup) VALUES ? ";
    con.query(inser,[[contrafinaldata]],function(err,result)
    {
      // console.log([paymentdata]);
    if (err) throw err;
    // console.log("Number of records inserted: " + result.affectedRows);
    res.json({'result':'Submitted'});
    });

  
})

app.post('/billsubmit',(req,res)=>
{
  // console.log(req.body.op);
  // var paymentdata=req.body.op;
  // paymentdata=paymentdata[0];
  // console.log(paymentdata);
  var billformObj= req.body.billformObj;
  console.log(billformObj);

  var billdetailstable= req.body.billdetailstable;
  console.log(billdetailstable);
  // console.log(contrafinaldata);
  var insert1 = "INSERT INTO `billtable`(`itemname`, `itemquantity`, `units`, `price`, `amount`, `billno`) VALUES ? ";
  var insert2 = "INSERT INTO `billdetailtable`(`billno`, `customername`, `number`, `type`, `total`, `servicecharge`, `taxableamount`, `discountamount`, `tax`, `grandtotal`) VALUES ? ";

    con.query(insert1,[billformObj],function(err,result)
    {
      // console.log([paymentdata]);
    if (err) throw err;
    console.log("Submitted");
    // console.log("Number of records inserted: " + result.affectedRows);
    // res.json({'result':'Submitted'});
    });

    con.query(insert2,[billdetailstable],function(err,result)
    {
      // console.log([paymentdata]);
    if (err) throw err;
    console.log("Submitted");
    // console.log("Number of records inserted: " + result.affectedRows);
    // res.json({'result':'Submitted'});
    });

  res.json({'result':'Submitted'});
})


// app.get('/',(req,res) =>{
// 	   res.sendFile(__dirname + '/public/payment.html');
//     // res.send()
//  // res.send('Hello world');
//  // console.log("HEll");
// });
var port = process.env.port || 3000;
app.listen(port,()=> console.log('Listening on port 3000'));
