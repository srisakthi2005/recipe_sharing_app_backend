const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors")

const app = express();
const port = 3000;

const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")

app.use(express.json());
app.use(cors());

const mongoURL = "mongodb+srv://srisakthib:srisakthi123@cluster0.dbpnokd.mongodb.net/recipe_sharing_app";
mongoose.connect(mongoURL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Connected to MongoDB...");
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((err) => console.log("Error connecting to MongoDB:", err));


const recipeSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  ingredients: { type: String, required: true },
  steps: { type: String, required: true },
});


const Recipe = mongoose.model("Recipe", recipeSchema);


app.get("/api/recipes", async (req, res) => {
  try {
    const recipes = await Recipe.find();
    res.status(200).json(recipes);
  } catch (err) {
    res.status(500).json({ error: "Error fetching recipes" });
  }
});

app.post("/api/recipes", async (req, res) => {
  const {id, name, ingredients, steps } = req.body;
  const newRecipe = new Recipe({ id, name, ingredients, steps });

  try {
    await newRecipe.save();
    res.status(201).json({ message: "Recipe added successfully", recipe: newRecipe });
  } catch (err) {
    res.status(400).json({ error: "Error adding the recipe", details: err.message });
  }
});

app.put("/api/recipes/:id", async (req, res) => {
  const { id } = req.params;
  const { name, ingredients, steps } = req.body;
  try {
    const updatedRecipe = await Recipe.findByIdAndUpdate(
      id, 
      { name, ingredients, steps },
      { new: true } 
    );
    if (!updatedRecipe) return res.status(404).json({ error: "Recipe not found" });
    res.status(200).json({ message: "Recipe updated successfully", recipe: updatedRecipe });
  } catch (err) {
    res.status(500).json({ error: "Error updating the recipe", details: err.message });
  }
});

app.delete("/api/recipes/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await Recipe.findByIdAndDelete(id); 
    if (!result) return res.status(404).json({ error: "Recipe not found" });
    res.status(200).json({ message: "Recipe deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Error deleting the recipe", details: err.message });
  }
});

const userSchema = new mongoose.Schema({
  username:{type:String,required:true,unique:true},
  password:{type:String,required:true}
  })
  const User = mongoose.model("User", userSchema);
app.post('/api/register', async (req,res)=>{
  const {username,password} = req.body;
  const hashedPasword = await bcrypt.hash(password, 10);
  const newUser = new User({username,password:hashedPasword});
  const savedUser = await newUser.save();
  res.status(201).json({message:"User created", user:savedUser});
});


app.post('/api/login', async (req,res)=>{
  const {username,password} = req.body;
  const user = await User.findOne({username});
      const isValidPassword = await bcrypt.compare(password,user.password);
      if(!isValidPassword){
          return res.status(401).json({error:"Invalid username or password"});
          }
          const token = jwt.sign({username: user.username},"my-key",{expiresIn:"1h"});

          res.status(200).json({message:"User logged in", token});
          }
      )
      
      
      const authorize=(req,res,next)=>{
          const token=req.headers["authorization"]?.split(" ")[1];
          console.log({token});
          if(!token)
          {
              return res.status(401).json({message:"No token provided"});
          }
          jwt.verify(token,"my-key",(error,userInfo)=>{
              if(error)
              {
                  return res.status(401).json({message:"Unauthorized"});
              }
              req.user=userInfo;
              next();
          });
      }
      
      app.get("/api/secured",authorize,(req,res)=>{
          res.json({message:"Access granted",user:req.user});
      });


      