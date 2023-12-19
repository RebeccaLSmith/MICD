import setuptools

# Reading the version from the VERSION file
with open('setup/VERSION', 'r') as version_file:
    version = version_file.read().strip()

# Reading requirements from the requirements.txt file
with open('setup/requirements.txt') as f:
    required = f.read().splitlines()

# Reading the contents of your README file
with open('README.md', 'r', encoding='utf-8') as fh:
    long_description = fh.read()

setuptools.setup(
    name='streamdeck',
    version=version,
    description='Library to control Elgato StreamDeck devices and connect to AWS IoT Core.',
    long_description=long_description,
    long_description_content_type='text/markdown',
    author='Rebecca Smith',
    author_email='Rebecca.l.Smith@gmail.com',
    url='https://github.com/RebeccaLSmith/MICD',
    package_dir={'': 'streamdeckapp'},
    packages=setuptools.find_packages(where='streamdeckapp'),
    install_requires=required,
    license="MIT",
    include_package_data=True,
    python_requires='>=3.8',
)