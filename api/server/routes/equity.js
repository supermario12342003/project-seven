/*
* @Author: Mengwei Choong
* @Date:   2018-07-18 16:06:27
* @Last Modified by:   Mengwei Choong
* @Last Modified time: 2018-07-18 17:46:31
*/

const express = require('express');
const Controller = require('../controllers/equity');
const controller = new Controller();
const router = express.Router();
const permissions = require('../permissions');

router.get('/', controller.getMany);
router.get('/:id([A-Z]{2}[A-Z0-9]{10})/quotations', controller.getQuotations);
router.get('/:id([A-Z]{2}[A-Z0-9]{10})', controller.getOne);

router.post('/', permissions.isAdmin, controller.create);
router.patch('/', permissions.isAdmin, controller.updateMany);
router.delete('/', permissions.isAdmin, controller.deleteMany);
router.put('/:id([A-Z]{2}[A-Z0-9]{10})', permissions.isAdmin, controller.update);
router.patch('/:id([A-Z]{2}[A-Z0-9]{10})', permissions.isAdmin, controller.update);
router.delete('/:id([A-Z]{2}[A-Z0-9]{10})', permissions.isAdmin, controller.delete);

module.exports = router