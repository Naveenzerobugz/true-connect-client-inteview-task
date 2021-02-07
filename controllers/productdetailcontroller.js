const productdetail = mongoose.model("productdetail");
const { validationResult } = require('express-validator');
const fs = require('fs');
const { CLIENT_RENEG_WINDOW } = require('tls');
module.exports = {
    add(req, res) {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        console.log(req.body);
        if (req.body.id) {
            return productdetail.findById(req.body.id)
                .then(result => {
                    if (!result) {
                        return res.status(200).send({ status: 1, message: 'No Product Found' })
                    }
                    console.log(result);
                    result.update({
                            name: req.body.productname,
                            description: req.body.description,
                            amount: req.body.amount,
                            sellingprice: req.body.sellingprice,
                            stock: req.body.stock,
                            image: req.body.imageid != "" ? req.body.imageid : req.file.id,
                        }).then(result => {
                            return res.status(200).send({ status: 0, message: 'This Product Updated Successfully' })
                        })
                        .catch(err => { return res.status(200).send({ status: 1, message: err.message }) })
                })
                .catch(err => { return res.status(200).send({ status: 1, message: err.message }) })
        }
        return productdetail.find({ name: req.body.productname })
            .then(result => {
                if (result.length != 0) {
                    return res.status(200).send({ status: 1, message: 'This Product Already Exsist' })
                }
                return productdetail.create({
                        name: req.body.productname,
                        description: req.body.description,
                        amount: req.body.amount,
                        sellingprice: req.body.sellingprice,
                        stock: req.body.stock,
                        image: req.file.id,
                    }).then(result => {
                        return res.status(200).send({ status: 0, message: 'This Product Added Successfully', result })
                    })
                    .catch(err => { return res.status(200).send({ status: 1, message: err.message }) })
            })
            .catch(err => { return res.status(200).send({ status: 1, message: err.message }) })
    },
    list(req, res) {
        return productdetail.aggregate([{
                    $match: {
                        isdeleted: 0
                    }
                },
                {
                    $lookup: {
                        from: "uploads.files",
                        "let": { "id": "$image", },
                        "pipeline": [{
                                "$match": {
                                    "$expr": {
                                        $and: [
                                            { $eq: ["$_id", "$$id"] },
                                        ]
                                    },
                                }
                            },
                            // {
                            //     $lookup: {
                            //         from: "uploads.chunks",
                            //         "let": { "id": "$_id", },
                            //         "pipeline": [{
                            //             "$match": {
                            //                 "$expr": {
                            //                     $and: [
                            //                         { $eq: ["$files_id", "$$id"] },
                            //                     ]
                            //                 },
                            //             }
                            //         }, ],
                            //         as: "imgchunks"
                            //     }
                            // }
                        ],
                        as: "image"
                    }
                }
            ])
            .then(result => {
                return res.status(200).send({ status: 0, result: result })
            })
            .catch(err => { return res.status(200).send({ status: 1, message: err.message }) })
    },
    getbyid(req, res) {
        return productdetail.findOne({ _id: req.params.id, isdeleted: 0 })
            .then(result => {
                return res.status(200).send({ status: 0, result: result })
            })
            .catch(err => { return res.status(200).send({ status: 1, message: err.message }) })
    },
    delete(req, res) {
        return productdetail.findById(req.body.id)
            .then(result => {
                if (!result) {
                    return res.status(200).send({ status: 1, message: 'No Data Found' })
                }
                productdetail.remove({
                        _id: req.body.id,
                    }).then(async finalresult => {
                        if (result.image) {
                            await gfs.delete(new mongoose.Types.ObjectId(result.image), (err, data) => {
                                if (err) {
                                    return res.status(404).json({ err: err.message });
                                }
                                return res.status(200).send({ status: 0, message: 'Product Deleted Successfully' })
                            });
                        } else {
                            res.status(200).send({ status: 0, message: 'Product Deleted Successfully', data })
                        }
                    })
                    .catch(err => { return res.status(200).send({ status: 1, message: err.message }) })
            })
            .catch(err => { return res.status(200).send({ status: 1, message: err.message }) })
    },
}