const Note = require("../models/Notes");
const mongoose = require('mongoose');



/**
 * Get /
 * Dashboard
 */


exports.dashboard = async (req, res) => {

  let perPage = 12;
  let page = req.query.page || 1

  const locals = {
    title: 'NotesApp NodeJs',
    description: 'Free NodeJs Notes App'
  }

  try {
    const notes = await Note.aggregate([
      { $sort: { createdAt: -1,} },
      { $match: { user: new mongoose.Types.ObjectId(req.user.id) } },
      {
        $project: {
          title: { $substr: ['$title', 0, 30] },
          body: { $substr: ['$body', 0, 90] },
        }
      }
    ]).skip(perPage * page - perPage)
      .limit(perPage)
      .exec();

    // const notes = await Note.find({});z
    const count = await Note.countDocuments();
    res.render('dashboard/index', {
      userName: req.user.firstName,
      locals,
      notes,
      layout: '../views/layouts/dashboard',
      current: page,
      pages: Math.ceil(count / perPage)
    });
  } catch (error) {
    console.log(error);
  }
}

/**
 * Get /
 * View Specific Note 
 */

exports.dashboardViewNote = async (req, res) => {
  const note = await Note.findById({ _id: req.params.id }).where({ user: req.user.id }).lean();

  if (note) {
    res.render("dashboard/view-notes", {
      noteID: req.params.id,
      note,
      layout: '../views/layouts/dashboard'
    });
  } else {
    res.send("Something Went Wrong.")
  }
}

/**
 * PUT /
 * Update Specific Note 
 */

exports.dashboardUpdateNote = async (req, res) => {
  try {
    await Note.findOneAndUpdate(
      { _id: req.params.id },
      { title: req.body.title, body: req.body.body, updatedAt: Date.now() }
    ).where({ user: req.user.id });
    res.redirect('/dashboard');
  } catch (error) {
    console.log(error);
  }
}

/**
 * DELETE /
 * Delete Note 
 */
exports.dashboardDeleteNote = async (req, res) => {
  try {
    await Note.deleteOne({ _id: req.params.id }).where({ user: req.user.id });
    res.redirect('/dashboard');
  } catch (error) {
    console.log(error);
  }
}

/**
 * GET /
 * Add Notes
 */

exports.dashboardAddNote = async (req, res) => {
  try {
    res.render('dashboard/add', {
      layout: '../views/layouts/dashboard',
    })
  } catch (error) {
  }
}

/**
 * POST /
 * Submitting The Route
 */
exports.dashboardAddNoteSubmit = async (req, res) => {
  try {
    req.body.user = req.user.id;
    await Note.create(req.body);
    res.redirect("/dashboard")
  } catch (error) {
    console.log(error);
  }
}


/**
 * GET /
 * Search The Note
 */
exports.dashboardSearch = async (req, res) => {
  try {
    res.render('dashboard/search', {
      searchResults: '',
      layout: '../views/layouts/dashboard',
    })
  } catch (error) {

  }
}

/**
 * GET /  
 * Submit The Note
 */
exports.dashboardSearchSubmit = async (req, res) => {
  try {
    let searchTerm = req.body.searchTerm;
    const searchNoSpecialChars = searchTerm.replace(/[A-Za-z0-9\._%+\-]+@[A-Za-z0-9\.\-]+\.[A-Za-z]{2,}/g, "");

    const searchResults = await Note.find({
      $or: [
        { title: { $regex: new RegExp(searchNoSpecialChars, 'i') } },
        { body: { $regex: new RegExp(searchNoSpecialChars, 'i') } },
      ]
    }).where({ user: req.user.id });

    res.render('dashboard/search', {
      searchResults,
      layout: '../views/layouts/dashboard',
    })

  } catch (error) {
    console.log(error);
  }
}
