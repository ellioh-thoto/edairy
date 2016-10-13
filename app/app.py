from flask import Flask, abort, request, render_template
import os

# Create the app
app = Flask(__name__)

@app.route('/', defaults={'page': 'index'})
@app.route('/<page>')
def show_page(page):
    """Map a URL path to a HTML filename"""
    html_root = os.path.abspath('html')
    print 'TEST : html_root : ' + html_root

    filename = os.path.join('app/html', page) + '.json'
    # filename = os.path.join('html', page)
    filename_abs = os.path.abspath(filename)
    print 'TEST : filename_abs : ' + filename_abs

    # Do we have an HTML file to match the URL?
    if not os.path.exists(filename_abs):
        abort(404)

    # Load the contents of our HTML file
    with open(filename_abs, 'r') as f:
        html = f.read()

    return html

@app.route('/save-my-page', methods=['POST'])
def save_page():
    """Save changes to a page"""

    print 'ENTER...'

    html_root = os.path.abspath('html')

    print 'PASS 1 ...'
    # Find the page
    filename = request.form['__page__']

    print 'PASS 2 ...'
    print 'TEST : filename : ' + filename

    if filename == '':
        filename = 'index' # The index page will appear as ''
    filename += '.html'

    # Is the filename safe to access?
    if not os.path.abspath(filename).startswith(html_root):
        abort(404)

    # Do we have an HTML file to match the URL?
    if not os.exists(filename):
        abort(404)

    # Read the contents of the HTML file and update it
    with open(filename, 'r') as f:
        html = f.read()

        # For each parameter in the request attempt to match and replace the
        # value in the HTML.
        for name, value in request.form.items():

            # Escape backslashes in the value for regular expression use
            value = value.replace('\\', '\\\\')

            # Match and replace editable regions
            start = '<!--\s*editable\s+' + re.escape(name) + '\s*-->'
            end = '<!--\s*endeditable\s+' + re.escape(name) + '\s*-->'
            html = re.sub(
                '({0}\s*)(.*?)(\s*{1})'.format(start_tag, end_tag),
                r'\1' + value + r'\3',
                template_html,
                flags=re.DOTALL
                )

    # Save changes to the HTML file
    with open(filename, 'w') as f:
        f.write(html)

    return 'saved'

if __name__ == "__main__":
    app.run()