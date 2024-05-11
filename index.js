const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;

const app = express();

//Must remove "/" from your production URL
app.use(
    cors({
        origin: [
            "http://localhost:3000",
            "https://unity-uplift-client.vercel.app"
        ],
        credentials: true,
    })
);

//middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.ulnoerh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

let client = null;

try {
    client = new MongoClient(uri, {
        serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true,
        },

    });
} catch (error) {
    console.error(error);
}


async function run() {
    try {
        const reliefCollection = client.db('unityUplift').collection('reliefGoods');

        //get all relief Goods
        app.get('/all-relief-goods', async (req, res) => {
            const query = {};
            const allReliefGoods = await reliefCollection.find(query).toArray();
            res.send({
                success: true,
                data: allReliefGoods,
                message: 'All data retrieved successfully'
            });
        });

        // get single relief goods
        app.get('/relief-goods/:id', async (req, res) => {
            try {
                const id = req.params.id;
                const query = { _id: new ObjectId(id) }
                const singleReliefGoods = await reliefCollection.findOne(query);
                console.log(singleReliefGoods);
                res.send({
                    success: true,
                    message: "Successfully got the data",
                    data: singleReliefGoods,
                })
            }
            catch (error) {
                console.log(error.name, error.message);
                res.send({
                    success: false,
                    error: error.message,
                });
            }

        })


        //limit relief goods
        app.get('/relief-goods', async (req, res) => {
            try {
                const query = {};
                const cursor = reliefCollection.find(query);
                const limitedReliefGoods = await cursor.limit(6).toArray();

                res.send({
                    success: true,
                    message: "Successfully got the 6 data",
                    data: limitedReliefGoods,
                });
            }
            catch (error) {
                console.log(error.name, error.message);
                res.send({
                    success: false,
                    error: error.message,
                });
            }
        })

        //for adding a Supply
        app.post('/dashboard/create-supply', async (req, res) => {
            try {
                const result = await reliefCollection.insertOne(req.body);
                // console.log("result from 33", result);
                if (result.insertedId) {
                    res.send({
                        success: true,
                        message: "Successfully added your relief Goods",

                    });
                } else {
                    res.send({
                        success: false,
                        error: "Couldn't add the product"
                    });
                };
            }
            catch (error) {
                console.log(error.name, error.message)
                res.send({
                    success: false,
                    error: error.message,
                });
            }
        });

        // update a supply
        app.patch('/dashboard/supply/:id', async (req, res) => {
            const id = req.params.id;
            try {
                const { _id, ...updatedFields } = req.body;
                const result = await reliefCollection.updateOne(
                    { _id: new ObjectId(id) },
                    { $set: updatedFields }
                );
                if (result.matchedCount) {
                    res.status(200).json({
                        success: true,
                        message: "Supply updated successfully",
                    });
                } else {
                    res.status(404).json({
                        success: false,
                        error: "Supply not found or couldn't be updated",
                    });
                }
            } catch (error) {
                console.error("Error updating service:", error);
                res.status(500).json({
                    success: false,
                    error: "Internal server error",
                });
            }
        });

        //delete a supply
        app.delete('/dashboard/supply/:id', async (req, res) => {
            const id = req.params.id;
            try {
                const result = await reliefCollection.deleteOne({
                    _id: new ObjectId(id)
                });
                if (result.deletedCount) {
                    res.send({
                        success: true,
                        message: 'Supply deleted successfully.'
                    });
                }
                else {
                    res.send({
                        success: false,
                        error: "Couldn't delete the service",
                    });
                }
            }
            catch (error) {
                console.error(error.name, error.message);
                res.send({
                    success: false,
                    error: error.message,
                });
            }
        })

    } finally {
        console.log("Operation is done.")
    }
}
run().catch(console.dir);


app.get('/', async (req, res) => {
    res.send('Uplift Server is Running');
})

app.listen(port, () => console.log(`Unity Uplift Server running on port: ${port}`))