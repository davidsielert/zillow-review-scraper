import cheerio from 'cheerio';
import request from 'superagent';

export default function scrape() {
    const url = 'http://www.zillow.com/profile/urbanmodernhomes/#reviews';
    request
    .get(url)
    .end(function (err, response) {
        if (!err) {
            const $ = cheerio.load(response.text);
            let reviews = [];
            //Retrieve the zuid from the page
            const zuid = $('input[name="zuid"]').val();
            getReviews(zuid).then(function(reviews) {
                console.log(`Retrieved ${reviews.length} reviews `)
            });
        }
    })
};
function getReviews(zuid) {
    console.log(`Getting Reviews for ${zuid}` );
    return new Promise((resolve, reject) => {
        let page = 1;
        let reviews = [];
        getReviewsForPage(zuid, page).then(function (response) {
            reviews = [...reviews,...response.reviews];
            if (response.pagination !== null) {
                let numPages = response.pagination.items[response.pagination.items.length - 1].num.value;
                let values = [];
                for (let i = 2; i  <= numPages ; i++) {
                    values.push(getReviewsForPage(zuid, i));
                }
                Promise.all(values)
                    .then(function (results) {
                        console.log('iterating over reviews');
                        results.forEach(function (item) {
                            reviews = [...reviews,...item.reviews];
                        });
                        resolve(reviews);
                    })
            } else {
                resolve(reviews);
            }
        });
    });
}
function getReviewsForPage(zuid, page) {
    console.log('getting reviews for page', page);
    let url = `https://www.zillow.com/ajax/review/ReviewDisplayJSONGetPage.htm?id=${zuid}&size=5&page=${page}&page_type=received&moderator_actions=0&reviewee_actions=0&reviewer_actions=0&proximal_buttons=1&hasImpersonationPermission=0`;
    return new Promise((resolve, reject) => {
        request.get(url)
            .end(function (err, response) {
                if (!err)
                    resolve(response.body);
                reject(err);
            });
    });
}


scrape();