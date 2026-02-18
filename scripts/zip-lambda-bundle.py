"""Create lambda-bundle.zip with proper Unix permissions for run.sh."""
import zipfile
import os
import sys

bundle_dir = os.path.join(os.path.dirname(__file__), '..', 'lambda-bundle')
output_zip = os.path.join(os.path.dirname(__file__), '..', 'lambda-bundle.zip')

if not os.path.isdir(bundle_dir):
    print(f"ERROR: {bundle_dir} does not exist", file=sys.stderr)
    sys.exit(1)

with zipfile.ZipFile(output_zip, 'w', zipfile.ZIP_DEFLATED) as zf:
    for root, dirs, files in os.walk(bundle_dir):
        for filename in files:
            filepath = os.path.join(root, filename)
            arcname = os.path.relpath(filepath, bundle_dir).replace('\\', '/')
            info = zipfile.ZipInfo(arcname)
            info.compress_type = zipfile.ZIP_DEFLATED
            # Set Unix permissions: rwxr-xr-x for .sh, rw-r--r-- for everything else
            if filename.endswith('.sh'):
                info.external_attr = 0o100755 << 16
            else:
                info.external_attr = 0o100644 << 16
            with open(filepath, 'rb') as f:
                zf.writestr(info, f.read())

print(f"Created {output_zip} ({os.path.getsize(output_zip)} bytes)")
