const data = {
  groups: [
    {
      description: 'Font',
      variables: [
        {
          name: 'font.body',
          description: 'Content font',
          type: 'font',
          default: 'normal normal 16px var(--default-font)'
        }
      ]
    },
    {
      description: 'Widths',
      variables: [
        {
          name: 'width.container',
          description: 'Content width',
          type: 'length',
          min: '100px',
          max: '2000px',
          default: '1300px'
        },
        {
          name: 'width.sidebar',
          description: 'Sidebar width',
          type: 'length',
          min: '100px',
          max: '2000px',
          default: '1300px'
        },
        {
          name: 'width.post',
          description: 'Post width (stream)',
          type: 'length',
          min: '100px',
          max: '2000px',
          default: '1300px'
        }
      ]
    }
  ],
  theme: { name: 'Blank Canvas', version: '1.0.0', author: 'Sergio Medina' },
  includable: [{
    type: 'All',
    includables: [
      'main',
      'content'
    ]
  },
  {
    type: 'AdSense,Blog',
    includables: [
      'defaultAdUnit'
    ]
  },
  {
    type: 'Blog,PopularPosts,FeaturedPost',
    includables: [
      'blogThisShare',
      'bylineByName',
      'bylineRegion',
      'commentsLink',
      'commentsLinkIframe',
      'emailPostIcon',
      'facebookShare',
      'footerBylines',
      'headerByline',
      'googlePlusShare',
      'linkShare',
      'otherSharingButton',
      'platformShare',
      'postAuthor',
      'postCommentsLink',
      'postJumpLink',
      'postLabels',
      'postLocation',
      'postReactions',
      'postShareButtons',
      'postTimestamp',
      'sharingButton',
      'sharingButtonContent',
      'sharingButtons',
      'sharingButtonsMenu',
      'sharingPlatformIcon'
    ]
  },
  {
    type: 'PopularPosts,FeaturedPost',
    includables: [
      'snippetedPostByline',
      'snippetedPostContent',
      'snippetedPosts',
      'snippetedPostThumbnail',
      'snippetedPostTitle'
    ]
  },
  {
    type: 'Blog',
    includables: [
      'aboutPostAuthor',
      'addComments',
      'commentAuthorAvatar',
      'commentDeleteIcon',
      'commentForm',
      'commentFormIframeSrc',
      'commentItem',
      'commentList',
      'commentPicker',
      'comments',
      'commentsTitle',
      'feedLinks',
      'feedLinksBody',
      'homePageLink',
      'iframeComments',
      'inlineAd',
      'manageComments',
      'nextPageLink',
      'post',
      'postBody',
      'postBodySnippet',
      'postCommentsAndAd',
      'postFooter',
      'postFooterAuthorProfile',
      'postHeader',
      'postMeta',
      'postMetadataJSONImage',
      'postMetadataJSONPublisher',
      'postPagination',
      'postTitle',
      'previousPageLink',
      'threadedCommentForm',
      'threadedCommentJs',
      'threadedComments'
    ]
  },
  {
    type: 'BlogArchive',
    includables: [
      'flat',
      'hierarchy',
      'interval',
      'posts'
    ]
  },
  {
    type: 'BlogSearch',
    includables: [
      'searchForm',
      'searchSubmit'
    ]
  },
  {
    type: 'Header',
    includables: [
      'behindImageStyle',
      'description',
      'image',
      'title'
    ]
  },
  {
    type: 'Label',
    includables: [
      'cloud',
      'list'
    ]
  },
  {
    type: 'PageList',
    includables: [
      'overflowButton',
      'overflowablePageList',
      'pageLink',
      'pageList'
    ]
  },
  {
    type: 'Profile',
    includables: [
      'authorProfileImage',
      'defaultProfileImage',
      'profileImage',
      'teamProfile',
      'teamProfileLink',
      'userGoogleProfile',
      'userLocation',
      'userProfile',
      'userProfileData',
      'userProfileImage',
      'userProfileInfo',
      'userProfileLink',
      'userProfileText',
      'viewProfileLink'
    ]
  },
  {
    type: 'Subscribe',
    includables: [
      'feeds'
    ]
  }]
}

module.exports = data
