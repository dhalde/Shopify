

exports.get404 = (req, res) => {
    // const isloggedIn = req.get('Cookie').split('=')[1];
    res.status(404).render('e_404', {
        pageTitle: 'Page Not Found',
        path: '/404'

    });
}
exports.get500 = (req, res) => {
    // const isloggedIn = req.get('Cookie').split('=')[1];
    res.status(500).render('e_505', {
        pageTitle: 'Error',
        path: '/505'

    });
}