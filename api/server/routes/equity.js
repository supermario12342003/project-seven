/*
* @Author: Mengwei Choong
* @Date:   2018-07-18 16:06:27
* @Last Modified by:   Mengwei Choong
* @Last Modified time: 2018-08-12 17:33:01
*/

const express = require('express');
const Controller = require('../controllers/equity');
const controller = new Controller();
const router = express.Router();
const permissions = require('../permissions');

router.get('/', controller.getMany);
router.get('/:id/quotations', controller.getQuotations);
router.get('/:id(\\d+)/reports', controller.getReports);
router.get('/:id(\\d+)', controller.getOne);

router.post('/', permissions.isAdmin, controller.create);
router.patch('/', permissions.isAdmin, controller.updateMany);
router.delete('/', permissions.isAdmin, controller.deleteMany);
router.put('/:id(\\d+)', permissions.isAdmin, controller.update);
router.patch('/:id(\\d+)', permissions.isAdmin, controller.update);
router.delete('/:id(\\d+)', permissions.isAdmin, controller.delete);

module.exports = router