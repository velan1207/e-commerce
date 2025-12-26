export default function ProductReview({reviews}) {
    return (
        <div className="reviews w-75">
            <h3>Other's Reviews:</h3>
            <hr />
            {reviews && reviews.map((review, idx) => (
                <div key={review._id || idx} className="review-card my-3">
                    <div className="rating-outer">
                        <div className="rating-inner" style={{width: `${(Number(review.rating) || 0)/5*100}%`}}></div>
                    </div>
                    <p className="review_user">by {(review.user && review.user.name) ? review.user.name : 'Guest'}</p>
                    <p className="review_comment">{review.comment}</p>

                    <hr />
                </div>
            ))
            }
          
        </div>
    )
}