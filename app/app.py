from flask import Flask, abort, request, render_template
import os, xml.etree.ElementTree as ET, json

# Create the app
app = Flask(__name__)

@app.route('/', defaults={'page': 'index'})
@app.route('/<page>')
def show_page(page):
    """Map a URL path to a HTML filename"""
    html_root = os.path.abspath('html')
    print 'TEST : html_root : ' + html_root

    if page == 'undefined':
        page = index

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
    filename = request.form['__filename__']
    title = request.form['__title__']
    content = request.form['main-content']

    print 'PASS 2 ...'
    print 'TEST : filename : ' + filename
    print 'TEST : title : ' + title

    if filename == '':
        filename = 'index' # The index page will appear as ''

    filename = os.path.join('html', filename) + '.html'
    filename_abs = os.path.abspath(filename)
    # filename += '.html'

    print 'TEST : filename_abs : ' + filename_abs

    # Is the filename safe to access?
#    if not os.path.abspath(filename).startswith(html_root):
#        abort(404)

    print 'PASS 3 ...'

    # Do we have an HTML file to match the URL?
#    if not os.path.exists(filename_abs):
#        abort(404)

    print 'PASS 4 ...'

    # Read the contents of the HTML file and update it
    #    with open(filename_abs, 'r') as f:
    #        html = f.read()
    #
    #        # For each parameter in the request attempt to match and replace the
    #        # value in the HTML.
    #        for name, value in request.form.items():
    #
    #            # Escape backslashes in the value for regular expression use
    #            value = value.replace('\\', '\\\\')
    #
    #            # Match and replace editable regions
    #            start = '<!--\s*editable\s+' + re.escape(name) + '\s*-->'
    #            end = '<!--\s*endeditable\s+' + re.escape(name) + '\s*-->'
    #            html = re.sub(
    #                '({0}\s*)(.*?)(\s*{1})'.format(start_tag, end_tag),
    #                r'\1' + value + r'\3',
    #                template_html,
    #                flags=re.DOTALL
    #                )

    #    html = content
    # Save changes to the HTML file
    print 'content : ' + content
    with open(filename_abs, 'w') as f:
        f.write(content)

    return 'saved'

@app.route('/noteslist')
def notelists():
    """Get all files"""

    strs = [x for x in os.listdir("html")]
    myjson = json.dumps([{'filename': k} for k in os.listdir("html")], indent=4)

    jsonvar= "{"
    for file in os.listdir("html"):
        if file.endswith(".html"):
            print(file)
            jsonobject = "{filename:" + file + "},"
            jsonvar+=jsonobject

    jsonvar += "{}}"

    #    return jsonvar
    return myjson


if __name__ == "__main__":
    app.run("", "8080")