/** @jsx React.DOM */

// IMPORTANT: Replace below with your Firebase app URL
var firebaseUrl = "https://woven-react.firebaseio.com/";

//var converter = new Showdown.converter();


var Comment = React.createClass({
    rawMarkup: function() {
        var rawMarkup = marked(this.props.children.toString(), {sanitize: true});
        return { __html: rawMarkup };
    },
    render: function() {
        //var rawMarkup = converter.makeHtml(this.props.children.toString());

        var rawMarkup = marked(this.props.children.toString(), {sanitize: true});
        return (
            <div className="comment">
            <h2 className="commentAuthor">{this.props.author}</h2>
        <span dangerouslySetInnerHTML={this.rawMarkup()} />
        </div>
        );
    }
});


var CommentList = React.createClass({
    render: function() {
        var commentNodes = this.props.data.map(function (comment, index) {
            return <Comment key={index} author={comment.author}>{comment.text}</Comment>;
        });
        return <div className="commentList">{commentNodes}</div>;
    }
});

var CommentForm = React.createClass({
    getInitialState: function() {
        return {author: '', text: ''};
    },
    handleAuthorChange: function(e) {
        this.setState({author: e.target.value});
    },
    handleTextChange: function(e) {
        this.setState({text: e.target.value});
    },
    handleSubmit: function(e) {
        e.preventDefault();
        var author = this.state.author.trim();
        var text = this.state.text.trim();
        if (!text || !author) {
            return;
        }
        this.props.onCommentSubmit({author: author, text: text});
        this.setState({author: '', text: ''});
    },
    render: function() {
        return (
            <form className="commentForm" onSubmit={this.handleSubmit}>
                <input
                    type="text"
                    placeholder="Your name"
                    value={this.state.author}
                    onChange={this.handleAuthorChange}
                />
                <input
                    type="text"
                    placeholder="Say something..."
                    value={this.state.text}
                    onChange={this.handleTextChange}
                />
                <input type="submit" value="Post" />
            </form>
        );
    }
});


//var CommentForm = React.createClass({
//    handleSubmit: function() {
//        var author = this.refs.author.getDOMNode().value.trim();
//        var text = this.refs.text.getDOMNode().value.trim();
//        this.props.onCommentSubmit({author: author, text: text});
//        this.refs.author.getDOMNode().value = '';
//        this.refs.text.getDOMNode().value = '';
//        return false;
//    },
//
//    render: function() {
//        return (
//            <form className="commentForm" onSubmit={this.handleSubmit}>
//        <input type="text" placeholder="Your name" ref="author" />
//            <input type="text" placeholder="Say something..." ref="text" />
//            <input type="submit" value="Post" />
//            </form>
//        );
//    }
//});


var CommentBox = React.createClass({
    mixins: [ReactFireMixin],

    handleCommentSubmit: function(comment) {
        var comments = this.state.data;
        // Optimistically set an id on the new comment. It will be replaced by an
        // id generated by the server. In a production application you would likely
        // not use Date.now() for this and would have a more robust system in place.
        var newComments = comments.concat([comment]);
        this.setState({data: newComments});
        // Here we push the update out to Firebase and let ReactFire update this.state.data
        this.firebaseRefs["data"].push(comment);
    },

    getInitialState: function() {
        return {
            data: []
        };
    },

    componentWillMount: function() {
        // Here we bind the component to Firebase and it handles all data updates,
        // no need to poll as in the React example.
        this.bindAsArray(new Firebase(firebaseUrl + "commentBox"), "data");
    },

    render: function() {
        return (
            <div className="commentBox">
            <h1>Comments</h1>
            <CommentList data={this.state.data} />
        <CommentForm onCommentSubmit={this.handleCommentSubmit} />
        </div>
        );
    }
});

React.render(
<CommentBox />,
    document.getElementById('content')
);