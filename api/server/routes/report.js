/*
* @Author: Mengwei Choong
* @Date:   2018-07-18 16:06:27
* @Last Modified by:   Mengwei Choong
* @Last Modified time: 2018-07-24 11:07:25
*/

const express = require('express');
const Controller = require('../controllers/report');
const controller = new Controller();
const router = express.Router();
const permissions = require('../permissions');

router.get('/', controller.getMany);
router.get('/:id(\\d+)', controller.getOne);

router.post('/', permissions.isAdmin, controller.create);
router.patch('/', permissions.isAdmin, controller.updateMany);
router.delete('/', permissions.isAdmin, controller.deleteMany);
router.put('/:id(\\d+)', permissions.isAdmin, controller.update);
router.patch('/:id(\\d+)', permissions.isAdmin, controller.update);
router.delete('/:id(\\d+)', permissions.isAdmin, controller.delete);

module.exports = router