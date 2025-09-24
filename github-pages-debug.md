# GitHub Pages Deployment Debug Guide

This guide helps troubleshoot GitHub Pages deployment issues for the Porter Plays Leaderboard project.

## 🔍 Quick Deployment Status Check

### 1. Repository Settings
- [ ] Repository is public or GitHub Pro/Team account
- [ ] GitHub Pages is enabled in repository settings
- [ ] Source is set to "Deploy from a branch" or "GitHub Actions"
- [ ] Branch is set to `main` (or appropriate branch)
- [ ] Folder is set to `/ (root)` since this is a root-level static site

### 2. Required Files Present
- [x] `index.html` - ✅ Main entry point exists
- [x] `styles.css` - ✅ Stylesheet exists  
- [x] `script.js` - ✅ JavaScript functionality exists
- [ ] `.nojekyll` - ⚠️ Recommended for non-Jekyll sites
- [ ] `CNAME` - Only if using custom domain

## 🚨 Common Issues & Solutions

### Issue 1: 404 Page Not Found
**Symptoms:** GitHub Pages URL shows 404 error

**Solutions:**
1. Ensure `index.html` is in the repository root
2. Check that GitHub Pages source is set to correct branch
3. Wait 5-10 minutes after deployment for changes to propagate
4. Clear browser cache and try incognito mode

### Issue 2: Styles Not Loading (CSS 404)
**Symptoms:** Page loads but appears unstyled

**Solutions:**
1. Verify `styles.css` path in `index.html` is relative (`./styles.css` or `styles.css`)
2. Check for case sensitivity issues in file names
3. Ensure CSS file is committed to repository
4. Check browser developer tools Network tab for 404 errors

### Issue 3: JavaScript Not Working
**Symptoms:** Interactive features don't work, console errors

**Solutions:**
1. Check browser console for JavaScript errors
2. Verify `script.js` path in `index.html`
3. Ensure ES6+ features are compatible with target browsers
4. Check for CORS issues with external API calls

### Issue 4: Jekyll Build Errors
**Symptoms:** Build fails with Jekyll-related errors despite not using Jekyll

**Solutions:**
1. Create `.nojekyll` file in repository root:
   ```bash
   touch .nojekyll
   git add .nojekyll
   git commit -m "Add .nojekyll for GitHub Pages"
   ```

### Issue 5: External API Calls Failing
**Symptoms:** Leaderboard data not loading, CORS errors

**Solutions:**
1. HTTPS requirement: GitHub Pages uses HTTPS, ensure API endpoints use HTTPS
2. CORS configuration: External APIs must allow requests from GitHub Pages domain
3. Mixed content: All resources must be served over HTTPS
4. Add error handling for failed API calls (already implemented in script.js)

## 🔧 Project-Specific Configuration

### Recommended Files to Add

#### 1. `.nojekyll`
Create this file to prevent Jekyll processing:
```bash
# In repository root
touch .nojekyll
```

#### 2. Custom Domain (Optional)
If using custom domain, create `CNAME` file:
```
your-domain.com
```

### Environment-Specific Considerations

#### API Configuration
- The project includes admin configuration for API endpoints
- Default API URLs may not work in production
- Admin password: `jmenichole0098` (as documented in README.md)
- Configure proper API endpoints in admin panel after deployment

#### Local vs Production URLs
- Local development: `file://` or `http://localhost`
- GitHub Pages: `https://jmenichole.github.io/porter-plays-leaderboard/`
- Custom domain: `https://your-domain.com`

## 🧪 Testing Deployment

### Manual Testing Steps
1. **Basic Loading**
   - [ ] Site loads without errors
   - [ ] All CSS styles apply correctly
   - [ ] JavaScript console shows no critical errors

2. **Navigation**
   - [ ] Header navigation works
   - [ ] Smooth scrolling to sections works
   - [ ] External links (Discord) open correctly

3. **Admin Functions**
   - [ ] Admin login modal opens
   - [ ] Password authentication works
   - [ ] Admin panel displays correctly

4. **Leaderboard Features**
   - [ ] Leaderboard sections render
   - [ ] Casino switching works
   - [ ] Error handling for missing API data

### Browser Testing
Test in multiple browsers:
- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari
- [ ] Edge

### Device Testing
- [ ] Desktop (1920x1080)
- [ ] Tablet (768px)
- [ ] Mobile (375px)

## 🛠️ Debug Commands

### Check Deployment Status
```bash
# View GitHub Pages build logs
# Go to: Repository → Actions → Pages build and deployment

# Check repository settings
# Go to: Repository → Settings → Pages
```

### Local Testing
```bash
# Simple HTTP server for testing
python3 -m http.server 8000
# or
npx serve .
# or
php -S localhost:8000
```

### Network Debugging
```javascript
// In browser console, check for failed requests
console.log('Checking network requests...');
// Open Developer Tools → Network tab
// Reload page and check for red (failed) requests
```

## 📊 Performance Optimization

### Current Asset Sizes
- `styles.css`: ~94KB - Consider minification
- `script.js`: ~90KB - Consider minification
- Images: Multiple PNG files - Consider optimization

### Recommendations
1. **Minify CSS/JS** for production
2. **Optimize images** - compress PNG files
3. **Enable gzip** compression (automatic on GitHub Pages)
4. **Add caching headers** (GitHub Pages handles this)

## 🚀 Deployment Checklist

Before deploying to GitHub Pages:
- [ ] All files committed and pushed to main branch
- [ ] `.nojekyll` file added if not using Jekyll
- [ ] No sensitive data (API keys, passwords) in code
- [ ] External links use `target="_blank" rel="noopener"`
- [ ] All paths are relative (no absolute file paths)
- [ ] HTTPS used for all external resources
- [ ] Admin credentials documented securely
- [ ] API endpoints configured for production

## 🆘 Emergency Fixes

### Site Completely Broken
1. Check repository → Actions for build errors
2. Revert to last working commit: `git revert HEAD`
3. Create `.nojekyll` if missing
4. Ensure `index.html` is in root directory

### Partial Functionality
1. Check browser console for JavaScript errors
2. Verify all file paths are relative
3. Test API endpoints manually
4. Clear browser cache completely

## 📞 Support Resources

- **GitHub Pages Documentation**: https://docs.github.com/en/pages
- **Repository Issues**: https://github.com/jmenichole/porter-plays-leaderboard/issues
- **Developer Contact**: @jmenichole
- **Community Support**: Discord server linked in navigation

---

**Last Updated**: Generated for Porter Plays Leaderboard deployment debugging
**Version**: 1.0
**Compatible with**: GitHub Pages standard deployment