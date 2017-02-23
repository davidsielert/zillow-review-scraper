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
                $('#profile-review-component .reviews-list').filter(function () {
                    let review = {
                        author: $('.review-reviewer-info',this).children().first().text(),
                        rating_title: $('.profile-overall-rating-desc',this).text(),
                        rating: $('.review-heading .zsg-rating',this).attr('class').split(' ')[1].replace('zsg-rating_',''),
                        body: $('.zsg-content-item.review-body span',this).text().replace('More Less',''),
                    };
                    reviews.push(review);
                });
                console.log(review.length);
            }
        })
};
scrape();