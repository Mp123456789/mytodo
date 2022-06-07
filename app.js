
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const _ = require("lodash");

const app = express();
let workItems = [];

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


//for mongo atlas database
mongoose.connect("mongodb+srv://ManavP:Manav123@cluster0.mkqj1.mongodb.net/todolistDB", {useNewUrlParser: true});



//mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser: true});


const itemSchema = { name: String };
const Item = mongoose.model('Item', itemSchema);

const item1 = new Item({name : "welcome to todo list"});
const item2 = new Item({name : "Hit the + button to add a new item"});
const item3 = new Item({name: "<-- HIt this to delete an item"});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemSchema]
};

const List = mongoose.model('List', listSchema);




app.get('/', function(req, res){

  Item.find({}, function(err,foundItems){
    // console.log(foundItems);

    if(foundItems.length === 0){
      Item.insertMany(defaultItems, function(err){
        if(err){
          // console.log(err);
        } else {
          // console.log("Successfully saved default items to db");
        }
      });
      res.redirect('/');
    } else {
    res.render("list", { listTitle:"Today", newListItem: foundItems });
  }
  });

  // res.render("list", { listTitle:"Today", newListItem: items });

});



app.get('/:customListName', function(req,res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, function(err, foundList){
    if(!err){
      if(!foundList){
        // Create a new list
        const list = new List({
           name: customListName,
           items:defaultItems
        });
        list.save();
        res.redirect('/'+ customListName);
      } else {
        // show an existing list

        res.render('list', {listTitle: foundList.name, newListItem: foundList.items});
      }
    }
  })

});



app.post('/', function(req,res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({name : itemName});

  if(listName === "Today"){
    item.save();
    res.redirect('/');
  } else {
    List.findOne({name:listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect('/' + listName);
    });
  }



  // let item = req.body.newItem;
  //
  // if(req.body.list === "Work"){
  //   workItems.push(item);
  //   res.redirect('/work');
  // } else {
  //   items.push(item);
  //   res.redirect('/');
  // }

});


app.post('/delete', function(req,res){
  const checkedItemId= req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItemId, function(err){
      if(!err){
        // console.log("Successfully deleted checked item");

        //without redirect no element will be deleted from web page
        res.redirect('/');

      }
    });
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}} , function(err, foundList){
      if(!err){
        res.redirect('/' + listName);
      }
    });
  }


});



// app.get('/work', function(req, res){
//
// // for using simply one web page
//   // res.render('list', {listTitle: "Work", newListItem: workItems});
//
// // using header, footer and main page differently and
// // join them using ejs
// res.render('list01', {listTitle: "Work", newListItem: workItems});
//
// });


//in list01 page
app.get('/about',function(req, res){
  res.render("about");
});

let port = process.env.PORT || 3000;
app.listen(port , function(){
  console.log('Server is listening on port 3000.');
});
