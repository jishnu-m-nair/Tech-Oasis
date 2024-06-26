const express = require('express')
const router = express.Router()
const admin = require('../controller/admin-controller')
const {AdminLogSession} = require('../middlewares/auth')
const {storage, upload} = require('../config/multerConfig')
const product = require('../controller/productController')
const category = require('../controller/categoryController')
 // Import category creation controller
const { categoryUpload } = require('../config/multerConfig'); // Import category upload middleware




router.get('/admin',(req,res) => {
    res.render('admin-index')
})

// router.get('/admin/signup',(req,res)=> {
//     res.render('admin-register')
// })
router.post('/admin/signup',admin.postAdminRegister)

//admin login
router.get('/admin/login',admin.adminlogin)
router.post('/admin/login',admin.adminloginpost)

//admin logout
router.get('/admin/logout',admin.adminlogout)

//admin user management
router.get('/admin/usermanagement',AdminLogSession,admin.usermanagement)
// router.post('/usermanagement',admin.usermanagementpost)
router.post('/admin/blockUser',AdminLogSession,admin.userblock)

//product route
router.get('/admin/product',(req,res)=>{
    res.render('products')
})

//admin product management
router.get('/admin/product-management',AdminLogSession,product.productManagementGet)
router.post('/admin/product-management/newProduct',upload.fields([{ name: 'image', maxCount: 1 }, { name: 'images' }]),product.productManagementCreate)
router.get('/admin/product-management/getCategories',AdminLogSession,product.productCategories);
router.post('/admin/product-management/editProduct/:Id',upload.fields([{ name: 'image', maxCount: 1 }, { name: 'images' }]),product.productManagementEdit);
router.delete('/admin/product-management/delete-product/:productId',product.productManagementDelete);
router.post('/admin/product-management/featuredProduct',product.productManagementPublish);
router.get('/admin/product-management/removeimg',AdminLogSession,product.removeProductImg)
router.get('/admin/product-search',AdminLogSession,product.productSearch)

// router.post('/admin/products/editProduct/:Id',upload.fields([{name: 'image', maxCount:1}, {name: ' images'}]),productManagementEdit)


// admin categories 
router.get('/admin/category-management',AdminLogSession,category.categoryManagementGet);
router.post('/admin/category-management/newCategory',AdminLogSession, categoryUpload.single('image'),category.categoryManagementCreate)
router.post('/admin/category-management/edit-category/:categoryId',AdminLogSession,categoryUpload.single('editImage'),category.categoryManagementEdit)
// router.delete('/admin/category-management/delete-category/:categoryId',category.categoryManagementDelete);
router.post('/admin/category-management/isFeatured',AdminLogSession,category.categoryManagementFeatured)


module.exports = router;