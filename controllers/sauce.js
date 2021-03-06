const Sauce = require('../models/Sauce');
const fs = require('fs');

exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    const sauce = new Sauce({
        ...sauceObject,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
    sauce.save()
        .then(() => res.status(201).json({ message: 'Objet enregistré !' }))
        .catch(error => res.status(400).json({ error }));
};

exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({
            _id: req.params.id
        })
        .then((sauce) => res.status(200).json(sauce))
        .catch((error) => res.status(404).json({ error: error }));
};

exports.modifySauce = (req, res, next) => {
    const sauceObject = req.file ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : {...req.body };
    Sauce.updateOne({ _id: req.params.id }, {...sauceObject, _id: req.params.id }, )
        .then(() => res.status(200).json({ message: 'Objet modifié !' }))
        .catch(error => res.status(400).json({ error }));
};

exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            const filename = sauce.imageUrl.split('/images/')[1];
            fs.unlink(`images/${filename}`, () => {
                Sauce.deleteOne({ _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'Objet supprimé !' }))
                    .catch(error => res.status(400).json({ error }));
            });
        })
        .catch(error => res.status(500).json({ error }));
};

exports.getAllStuff = (req, res, next) => {
    Sauce.find()
        .then((sauces) => res.status(200).json(sauces))
        .catch((error) => res.status(400).json({ error: error }));
};


exports.likes = (req, res, next) => {
    const userId = req.body.userId;
    const like = req.body.like;

    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {

            if (userId) {
                if (like === 1) {
                    Sauce.updateOne({ _id: req.params.id }, { $push: { usersLiked: userId }, $inc: { likes: 1 } })
                        .then(() => res.status(200).json({ message: 'Sauce Liked' }))
                        .catch((error) => res.status(400).json({ error: error }))
                }
                if (like === -1) {
                    Sauce.updateOne({ _id: req.params.id }, { $push: { usersDisliked: userId }, $inc: { dislikes: 1 } })
                        .then(() => res.status(200).json({ message: 'Sauce Disliked' }))
                        .catch((error) => res.status(400).json({ error: error }))
                }
                if (like === 0) {
                    const liked = sauce.usersLiked.find(element => element == userId);
                    const disliked = sauce.usersDisliked.find(element => element == userId);

                    if (liked) {
                        Sauce.updateOne({ _id: req.params.id }, { $pull: { usersLiked: userId }, $inc: { likes: -1 } })
                            .then(() => res.status(200).json({ message: 'Sauce Disliked' }))
                            .catch((error) => res.status(400).json({ error: error }))
                    }
                    if (disliked) {
                        Sauce.updateOne({ _id: req.params.id }, { $pull: { usersDisliked: userId }, $inc: { dislikes: -1 } })
                            .then(() => res.status(200).json({ message: 'Sauce Disliked' }))
                            .catch((error) => res.status(400).json({ error: error }))
                    }
                }
            }
        })


}