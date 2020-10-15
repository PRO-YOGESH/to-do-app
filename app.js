//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();
app.use(bodyParser.urlencoded({
  extended: true
}));

app.set("view engine", "ejs");
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-yogesh:iamyogesh@cluster0.wpl3x.mongodb.net/todolistDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
});
const itemSchema = new mongoose.Schema({
  itemName: String,

});
const Item = mongoose.model("Item", itemSchema);

const listSchema = new mongoose.Schema({
  listName: String,

  items: [itemSchema]
});
const List = mongoose.model("List", listSchema);


app.get("/", function(req, res) {

  var today = new Date();

  var options = {
    day: "numeric",
    month: "long",
    year: "numeric",
    weekday: "long"
  };

  var day = today.toLocaleDateString("en-US", options);

  Item.find({}, function(err, items) {
    if (err) {
      console.log(err);
    } else {

      res.render("list", {
        titleInEjs: day,
        newItemsInejs: items
      });
    }
  });

});


app.post("/", function(req, res) {

  let newItem = req.body.newItemInejs;
  let newList = req.body.listName;

  const item1 = new Item({
    itemName: newItem
  });


  if (newList[newList.length - 1] <= '0' && newList[newList.length - 1] <= '9') {
    item1.save();

    res.redirect("/");
  } else {
    List.findOne({
      listName: newList
    }, function(err, foundList) {
      foundList.items.push(item1);
      foundList.save();
      res.redirect("/" + newList);
    });

  }


});

app.post("/delete", function(req, res) {
  const checkedItemId = req.body.checkbox;
  const listToDelete = req.body.listNameToDelete;
  if (listToDelete[listToDelete.length - 1] <= '0' && listToDelete[listToDelete.length - 1] <= '9') {
    Item.findByIdAndRemove(checkedItemId, function(err) {
      if (!err) {
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({
      listName: listToDelete
    }, {
      $pull: {
        items: {
          _id: checkedItemId
        }
      }
    }, function(err, foundList) {
      if (!err) {
        res.redirect("/" + listToDelete);
      }
    });
  }


});


app.get("/:newRoute", function(req, res) {
  const customListName = _.capitalize(req.params.newRoute);

  List.findOne({
    listName: customListName
  }, function(err, resultFound) {
    if (!err) {
      if (resultFound) {
        res.render("list", {
          titleInEjs: resultFound.listName,
          newItemsInejs: resultFound.items
        });

      } else {
        const newList = new List({
          listName: customListName
        });
        newList.save();
        res.redirect("/" + customListName);
      }
    }
  });

});





app.listen(3000, function() {
  console.log("server running at port 3000");
});
